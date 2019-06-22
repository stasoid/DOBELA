/* 
   This file exists only because I became accustomed to have part of interpreter source code in this file,
   it doesn't serve any interfacing purpose. All frontends #include "interpreter.c" instead.
   dobcon/dobgui/dobweb include interpreter.c to redefine assert.
   tester includes interpreter.c because it seems more logical - it needs access to the guts of the interpreter.
*/
#define byte unsigned char
#define bool char

typedef enum{NOPROGRAM,NORMAL,TERMINATED,ERROR} estate;
extern estate state;
extern char errortext[];

// order is important, used in dot_sorter
typedef enum{ down, right, left, up } edir;
enum{ NONE }; // for Command::type

typedef struct Dot Dot;
/*struct Dot
{
	byte bit;     // Zero or One
	edir dir : 8; // left, right, up or down

	// `generated` `blocked` `destroy` are used temporarily inside step
	// after step() is finished all dots have `generated` and `blocked` flags set to false and all dots with `destroy` flag are deleted
	bool generated; // indicates that a dot has been generated by one of :=+_v commands
	bool blocked;   // indicates that a dot is blocked from moving according to rule 2.5
	bool destroy;   // indicates that a dot will be destroyed (used in handling of dot-dot collisions)
};/*/
//https://msdn.microsoft.com/en-us/library/1d48zaa8.aspx
#pragma pack(1)
struct Dot
{
	char bit:1;     // Zero or One
	char dir : 2; // left, right, up or down

	// `generated` `blocked` `destroy` are used temporarily inside step
	// after step() is finished all dots have `generated` and `blocked` flags set to false and all dots with `destroy` flag are deleted
	char generated:1; // indicates that a dot has been generated by one of :=+_v commands
	char blocked:1;   // indicates that a dot is blocked from moving according to rule 2.5
	char destroy:1;   // indicates that a dot will be destroyed (used in handling of dot-dot collisions)
};
c_assert(sizeof(Dot)==1);

typedef struct Generator Generator;
struct Generator // ':'
{
	bool on;  // enabled/disabled
	byte bit; // generates Zeros/Ones
};

typedef struct Bar Bar;
struct Bar // '|'
{
	byte state; // '#' or up or down
};

typedef struct Command Command;
struct Command
{
	char type; // NONE, #| :=+ _$^v
	union{
		Generator gen; // type == ':'
		Bar bar;       // type == '|'
	};
};
c_assert(sizeof(Command)==3);

#define MAXDOTS 8
typedef struct Slot Slot;
struct Slot
{
	Command cmd;
	byte ndots;
	Dot dots[MAXDOTS];
	bool create_hash; // used temporarily inside step; true if # will be created in this slot because of dots collision
};
c_assert(sizeof(Slot)==13);

extern int frame;
extern int width, height;
extern Slot* code;

bool loadfile(char* filename);
bool loadcode(char* str);

bool step();
char* getframe();
// returns whole program state as one big string
// intended for use by dobweb, but can be used by any other client
// one string is easier to pass to js
// state(noprogram|normal|terminated|error) \f errortext \f err_x \f err_y \f breakpoints \f width \f height \f number-of-dots \f number-of-generators \f number-of-active-generators \f number-of-inputs \f reached-end-of-input \f frame-number \f frame-content \f fifo
/* 
[0]  state(noprogram|normal|terminated|error) 
[1]  errortext
[2]  err_x
[3]  err_y
[4]  breakpoints 
[5]  width 
[6]  height 
[7]  number-of-dots 
[8]  number-of-generators 
[9]  number-of-active-generators 
[10] number-of-inputs 
[11] reached-end-of-input 
[12] frame-number
[13] frame-content 
[14] fifo
*/
// getstate and functions it calls must not use asserts - dobweb does not have protection from this
char* getstate();

// implementation is provided by interpreter frontend (console or gui)
// this function may block until some more input is available if called from console
// if it returned false it means that eof was reached, it will not be called again for current program
bool input(byte* bit);
// this callback is used to clear input buffer, if there is one (like in dobcon)
// if there is no input buffer (like in dobgui/dobweb) this function does nothing
void clear_input_buffer();

// implementation is provided by interpreter frontend (console or gui)
// note: output is in bytes, unlike input
// bytes is null-terminated, but may contain null bytes
// count does not include null terminator
void output(byte* bytes, int count);