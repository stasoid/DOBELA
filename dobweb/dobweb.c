// cannot place these in macros.h because it cannot be included before interpreter.c
#define S_(x) #x
#define S(x) S_(x)
#define __SLINE__ S(__LINE__)

#include <emscripten.h>
#define assert(e) ((e) ? 0 : emscripten_run_script("throw 'Bug in the interpreter. Assertion failed at "__FILE__":"__SLINE__".'"))
#include "../interpreter.c"

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

typedef struct Buf Buf;
struct Buf
{
	byte* data;
	int count;
};

// helper for replace_all
// replace first occurrence of b in src with repl
// src is not null-terminated, may contain null bytes
// repl is null-terminated
// result is not null-terminated
// if b is not found in src returns {src,srclen}
Buf replace(byte* src, int srclen, byte b, byte* repl)
{
	int i;
	for(i=0; i<srclen; i++) if(src[i] == b) break;
	if(i == srclen) return (Buf){src,srclen};

	int replen = strlen(repl);
	int dstlen = srclen-1+replen;
	byte* dst = malloc(dstlen);
	memcpy(dst, src, i);
	memcpy(dst+i, repl, replen);
	memcpy(dst+i+replen, src+i+1, srclen-i-1);
	return (Buf){dst,dstlen};
}

// replace all occurrences of b in src with repl
// replace_all always creates a copy of src, even if no replacement was done
Buf replace_all(byte* src, int srclen, byte b, byte* repl)
{
	src = memdup(src, srclen);
	while(1)
	{
		Buf dst = replace(src, srclen, b, repl);
		if(dst.data == src) return dst;
		free(src);
		src = dst.data;
		srclen = dst.count;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

byte input_buffer;
int input_bitindex; // index of next unread bit left in buffer

void clear_input_buffer()
{
	input_buffer = 0;
	input_bitindex = 0;
}

int dobweb_getchar()
{
	// not passing any args, so using _V version of the macro
	// see comment for EM_ASM_INT in emscripten.h (v1.12.0)
	return EM_ASM_INT_V({return input_getchar_callback();});
}

// same as in dobcon except for dobweb_getchar
bool input(byte* bit)
{
	if(input_bitindex == 0)
	{
		int ch = dobweb_getchar();
		//EM_ASM_INT({print($0);},ch);
		if(ch == EOF) return false;
		input_buffer = ch;
	}
	*bit = (input_buffer >> input_bitindex) & 1;
	input_bitindex = (input_bitindex+1) % 8;
	return true;
}

void output(byte* bytes, int count)
{
	Buf buf,old;
	// escape some chars
	buf = replace_all(bytes, count, '\\', "\\\\"); // must be first
	old = buf;
	buf = replace_all(buf.data, buf.count, 0, "\\000");
	free(old.data); old = buf;
	buf = replace_all(buf.data, buf.count, '\'', "\\'");
	free(old.data); old = buf;
	buf = replace_all(buf.data, buf.count, '\n', "\\n");
	free(old.data);
	// add null byte
	buf.data = realloc(buf.data, buf.count+1);
	buf.data[buf.count] = 0;

	char* script = malloc(buf.count+100);
	snprintf(script, buf.count+100-1, "output_callback('%s')", buf.data);
	emscripten_run_script(script);

	free(buf.data);
	free(script);
}
