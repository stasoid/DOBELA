#define S_(x) #x
#define S(x) S_(x)
#define __SLINE__ S(__LINE__)

void error(char* msg);

#ifdef WIN32
__declspec(dllimport) int __stdcall IsDebuggerPresent(void);
#define assert(e) ((e) ? 0 : IsDebuggerPresent() ? __debugbreak() : error("Bug in the interpreter. Assertion failed at "__FILE__":"__SLINE__))
#else
#define assert(e) ((e) ? 0 : error("Bug in the interpreter. Assertion failed at "__FILE__":"__SLINE__))
#endif

#include "../interpreter.c" // backend


void error(char* msg) { fprintf(stderr, msg); exit(1); }

char* usage = "Usage: dobcon <filename>";

int main(int argc, char* argv[])
{
	if(argc == 1) error(usage);

	if(!loadfile(argv[1])) error(errortext);

	while(step());

	if(state == ERROR) error(errortext);
	return 0;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                   Callbacks called by backend: clear_input_buffer, input, output                                     //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

byte input_buffer;
int input_bitindex; // index of next unread bit left in buffer

// clear_input_buffer is not useful in dobcon because loadfile is called only once, but I provide implementation anyway for completeness
void clear_input_buffer()
{
	input_buffer = 0;
	input_bitindex = 0;
}

bool input(byte* bit)
{
	if(input_bitindex == 0)
	{
		int ch = getchar();
		if(ch == EOF) return false;
		input_buffer = ch;
	}
	*bit = (input_buffer >> input_bitindex) & 1;
	input_bitindex = (input_bitindex+1) % 8;
	return true;
}

void output(byte* bytes, int count)
{
	// bytes may contain null bytes, so using putchar instead of puts/printf
	for(int i=0; i < count; i++) putchar(bytes[i]);
}
