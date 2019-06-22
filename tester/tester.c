//#include "../crt.h"
//#include "../macros.h"
//#include "../array.h"
#include "../interpreter.c"

// not including stop
str_array slice(str_array arr, int start, int stop)
{
	if(stop == -1) stop = arr.count;
	assert(stop > start);
	str_array tmp = {stop-start, &arr.data[start]};
	str_array ret = {0};
	clone_array(tmp, ret);
	return ret;
}

// test file format: ..\spec-tests\test-format.txt
// currently only 2 frames are supported (so there can be only one line starting with *)

void error(char* msg) { puts(msg); exit(1); }

//debug
void print_code(Code* code)
{
	Slot* slot;
	RB_FOREACH(slot, Code, code)
	{
		printf("x=%d y=%d cmd=%c ndots=%d\n", slot->x, slot->y, slot->cmd.type, slot->ndots);
	}
	puts("===================================");
}

typedef struct Frame Frame;
struct Frame
{
	int width, height;
	Code code;
};

bool isdirchar(char c) { return c=='l'||c=='r'||c=='u'||c=='d'; }

int getdir(char c)
{
	switch(c)
	{
	case 'l': return left;
	case 'r': return right;
	case 'u': return up;
	case 'd': return down;
	default: return -1;
	}
}

char get_char(str_array lines, int x, int y)
{
	if(!(y >= 0 && y < lines.count)) return 0;
	if(!(x >= 0 && x < strlen(lines.data[y]))) return 0;
	return lines.data[y][x];
}

// compare with create_slot
Slot* read_test_slot(str_array lines, int x, int y)
{
	char ch = get_char(lines, x, y);
	switch(ch)
	{
	case '.':
	case ',':
		{
			// left/right/up/down neighbours
			char l = get_char(lines, x-1, y);
			char r = get_char(lines, x+1, y);
			char u = get_char(lines, x, y-1);
			char d = get_char(lines, x, y+1);
			if(isdirchar(l)+isdirchar(r)+isdirchar(u)+isdirchar(d) > 1) error("ambiguous direction indicators");
			int a[4] = {getdir(l),getdir(r),getdir(u),getdir(d)};
			int dir = a[0]>=0?a[0]: a[1]>=0?a[1]: a[2]>=0?a[2]: a[3]>=0?a[3]: right;

			Slot* slot = new(Slot, {.x=x, .y=y});
			Dot dot = {.bit=(ch=='.'), .dir=dir};
			add_dot(slot, dot);
			return slot;
		}
	case '|': return new(Slot, {.x=x, .y=y, .cmd={.type='|', .bar.state='#'}});
	case ':': return new(Slot, {.x=x, .y=y, .cmd={.type=':', .gen={.on=1, .bit=1}}}); // By default, the emission setting is enabled and it outputs Ones.
	case '#':
	case '=':
	case '+':
	case '_':
	case '$':
	case '^':
	case 'v': return new(Slot, {.x=x, .y=y, .cmd={.type=ch}});
	default:  return 0;
	}
}

Frame readframe(str_array lines)
{
	Code code = {0};
	int width = 0;
	int height = lines.count;
	for(int y=0; y < height; y++)
	{
		char* line = lines.data[y];
		int len = strlen(line);
		if(len > 0 && line[len-1] == '\r' && y != height-1) line[len] = 0, len--; // last line ends with \0, not \n, hence y != height-1
		if(width < len) width = len;
		
		for(int x=0; x < len;  x++)
		{
			Slot* slot = read_test_slot(lines, x, y);
			if(!slot) continue;
			RB_INSERT(Code, &code, slot);
			if(slot->cmd.type == '_') error("inputs are not supported in test files");
		}
	}

	return (Frame){.width=width, .height=height, .code=code};
}

Frame frame0, frame1;

// str is null-terminated
void readtest(char* str)
{
	str_array lines = split(str, '\n');
	int divider = -1; // index of frame divider line (line starting with *)
	for(int i = 0; i < lines.count; i++)
	{
		char* ln = lines.data[i];
		if(*ln && ln[strlen(ln)-1] == '\r') ln[strlen(ln)-1] = 0;
		if(*ln == '*')
		{
			if(divider != -1) error("currently only 2 frames are supported (so there can be only one line starting with *)");
			else divider = i;
		}
	}
	if(divider == -1) error("frame divider not found");
	
	frame0 = readframe(slice(lines, 0, divider));
	frame1 = readframe(slice(lines, divider+1, -1));
	//debug
	//print_code(&frame1.code);

	if(frame0.width != frame1.width || frame0.height != frame1.height) error("frames must have identical size");
}

bool is_equal_slot(Slot* s0, Slot* s1)
{
	if(s0->cmd.type != NONE) return s1->cmd.type != NONE && s0->cmd.type == s1->cmd.type && s0->ndots == 0 && s1->ndots == 0;
	if(s0->ndots != 0) return s0->ndots == 1 && s1->ndots == 1 && 
		s0->dots[0].bit == s1->dots[0].bit && s0->dots[0].dir == s1->dots[0].dir;
	// else: s0->cmd.type == NONE and s0->ndots == 0
	return s1->cmd.type == NONE && s1->ndots == 0;
}

Slot* get_frame_slot(Frame f, int x, int y)
{
	//assert(xyok(x,y));

	Slot dummy = {.x=x, .y=y};
	Slot* slot = RB_FIND(Code, &f.code, &dummy);
	if(!slot)
	{
		slot = new(Slot, {.x=x, .y=y}); // create empty slot
		RB_INSERT(Code, &f.code, slot);
	}
	return slot;
}


bool is_equal_frame(Frame f0, Frame f1)
{
	//debug
	//print_code(&f1.code);
	if(f0.width != f1.width || f0.height != f1.height) return false;
	Slot* slot;
	RB_FOREACH(slot, Code, &f0.code)
	{
		Slot* slot1 = get_frame_slot(f1,slot->x,slot->y);
		if(!is_equal_slot(slot, slot1)) {
			return false;
		}
	}
	RB_FOREACH(slot, Code, &f1.code)
	{
		if(!is_equal_slot(slot, get_frame_slot(f0,slot->x,slot->y))) {
			return false;
		}
	}
	return true;
}

int main(int argc, char* argv[])
{
	if(argc < 2) error("specify filename");
	char* str = readfile(argv[1], 0);
	if(!str) error("cannot read file");

	readtest(str);

	width = frame0.width;
	height = frame0.height;
	code = frame0.code;
	state = NORMAL;

	step();

	Frame frame = {.width=width, .height=height, .code=code};
	if(is_equal_frame(frame, frame1)) puts("pass");
	else error("FAILURE");
}

void clear_input_buffer(){}
bool input(byte* bit){return false;}
void output(byte* bytes, int count){error("output in tests is not supported");}