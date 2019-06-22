//
// dobgui frontend is abandoned, may work incorrectly
//

#define S_(x) #x
#define S(x) S_(x)
#define __SLINE__ S(__LINE__)

void error(char* msg);

// same assert as in dobcon #ifdef WIN32, only `error` function is different
__declspec(dllimport) int __stdcall IsDebuggerPresent(void);
#define assert(e) ((e) ? 0 : IsDebuggerPresent() ? __debugbreak() : error("Bug in the interpreter. Assertion failed at "__FILE__":"__SLINE__))
#include "../interpreter.c"

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#undef ERROR

#define wchar wchar_t

enum{
	VK_ESC       = VK_ESCAPE,
	VK_CTRL      = VK_CONTROL,
	VK_ALT       = VK_MENU,
	VK_ENTER     = VK_RETURN,
	VK_BACKSPACE = VK_BACK,
};

enum{ // color
	// rapidtables.com/web/color/RGB_Color.htm
	Black		= RGB(0,0,0),
	Grey		= RGB(128,128,128),
	DarkGrey	= RGB(169,169,169),
	Silver		= RGB(192,192,192),
	LightGrey	= RGB(211,211,211),
	White		= RGB(255,255,255),

	Red			= RGB(255,0,0),
	Orange		= RGB(255,165,0),
	Blue		= RGB(0,0,255),
	Pink		= RGB(255,192,203),
	HotPink		= RGB(255,105,180),
};

#define color_t COLORREF

int grow_aligned(int val, int align)
{
	return val - val % align + align; // or (val/align+1)*align
}

int shrink_aligned(int val, int align)
{
	int rem = val % align;
	return rem ? val - rem : val - align;
}

void error(char* msg) { MessageBoxA(0, msg, "error", 0); exit(1); }


void MessageLoop();
HWND CreateMainWindow();
void OnSize(HWND hwnd);
HFONT font; // font for code table and for input_wnd/fifo_wnd/output_wnd
HWND hwnd; // main window
HWND vert_sb, horz_sb; // scrollbars
HWND status, inputlabel, input_wnd, fifolabel, fifo_wnd, outputlabel, output_wnd, cheatsheet;

void output(byte* bytes, int count)
{
	char* str = memdup(bytes, count+1);
	// to simplify things, replace null bytes with spaces,
	for(int i=0; i < count; i++) if(!str[i]) str[i] = ' ';

	char buffer[1024];
	GetWindowTextA(output_wnd, buffer, countof(buffer)-1);
	strncat(buffer, str, countof(buffer)-2-strlen(buffer));
	SetWindowTextA(output_wnd, buffer);

	free(str);
}

void RefreshWindow(HWND hwnd)
{
	InvalidateRect(hwnd,0,0);
}

extern bool program_running;

void update_gui()
{
	RefreshWindow(hwnd);

	str_array ar_state = split(getstate(), '\f');
	char buffer[1000] = {0};
	_snprintf(buffer, countof(buffer)-1, 
		"Frame: %s; dots: %s; a.gens: %s; status: %s %s", 
		ar_state.data[12], ar_state.data[7], ar_state.data[9], state != NORMAL ? ar_state.data[0] : program_running ? "running" : "stopped", state == ERROR ? ar_state.data[1] : "");

	SetWindowTextA(status, buffer);
	SetWindowTextA(fifo_wnd, ar_state.data[14]);
	delete_ptr_array(ar_state);
}

void stop();

void LoadFile(char* filename)
{
	stop();

	if(!loadfile(filename))
		loadcode("");

	SetWindowTextA(hwnd, filename);
	OnSize(hwnd); // recalc grid
	update_gui();
}

SIZE GetTextSize(HFONT fnt, wchar* str, int len)
{
	HDC hdc = GetDC(0); // get dc for the monitor
	SelectObject(hdc, fnt);
	
	SIZE size;
	GetTextExtentPoint32(hdc, str, len, &size);
	
	ReleaseDC(0, hdc);
	return size;
}


int cellwidth, cellheight; // without border
int bdr = 1; // border
// full width/height of code table and width/height available for display of code table
int tablewidth, tableheight, avail_width, avail_height;
int tableleft, tabletop;
char* filename;
char* inputfile; // dobgui -i inputfile filename
char* input_data; // contents of inputfile
byte input_buffer; // current byte that is being processed
int input_bitindex; // index of next unread bit left in buffer
bool program_running;

void update_input()
{
	SetWindowTextA(input_wnd, input_data);
}

void clear_input_buffer()
{
	input_buffer = 0;
	input_bitindex = 0;
	*input_data = 0;
}

int dobgui_getchar()
{
	if(!input_data[0]) return EOF;
	int ch = input_data[0];
	// remove input_data[0]
	memmove(input_data, input_data+1, strlen(input_data)-1);
	input_data[strlen(input_data)-1] = 0;
	return ch;
}

// same as in dobcon except for dobgui_getchar and update_input
bool input(byte* bit)
{
	if(input_bitindex == 0)
	{
		int ch = dobgui_getchar();
		if(ch == EOF) { update_input(); return false; }
		input_buffer = ch;
	}
	*bit = (input_buffer >> input_bitindex) & 1;
	input_bitindex = (input_bitindex+1) % 8;
	update_input();
	return true;
}


void LoadInputFile()
{
	if(!inputs.count) return;

	if(!inputfile)
	{
		char* msg =
			"The program contains inputs (_). Specify inputfile in command line:\n"
			"dobgui -i inputfile srcfile\n"
			"or:\n"
			"dobgui -i nul srcfile\n"
			"The program will proceed as if -i nul was specified.";
		MessageBoxA(hwnd, msg, "error", MB_OK | MB_ICONERROR);
		inputfile = "nul";
		return;
	}
	if(strcmp(inputfile,"nul") == 0)
		return;

	int count = 0;
	byte* buffer = readfile(inputfile, &count);

	if(!buffer)
	{
		char msg[1024] = {0};
		_snprintf(msg, countof(msg)-1, 
			"Cannot read inputfile:\n"
			"%s\n"
			"The program will proceed as if -i nul was specified.", inputfile);
		MessageBoxA(hwnd, msg, "error", MB_OK | MB_ICONERROR);
		inputfile = "nul";
		*input_data = 0;
		return;
	}

	input_data = realloc(input_data, count+1);
	memcpy(input_data, buffer, count+1);
	free(buffer);

	update_input();
}

void ProcessArgs()
{
	if(__argc == 1) return;
	if(__argv[1][0] == '-')
	{
		if(__argv[1][1] == 'i' && __argc >= 3)
		{
			inputfile = __argv[2];
		}
		if(__argc >= 4)
			filename = __argv[3];
	}
	else
		filename = __argv[1];

	if(filename)
	{
		LoadFile(filename);
		LoadInputFile();
	}
	elif(inputfile)
		MessageBoxA(hwnd, "inputfile is specified without srcfile", "error", MB_OK | MB_ICONERROR);
}

int __stdcall WinMain( HINSTANCE _1, HINSTANCE _2, LPSTR _3, int _4 )
{
	input_data = calloc(1,1);

	struct{ wchar* name; int points; } f = 
	//{L"Courier New", 12};
	{L"Consolas", 16};
	//{L"Consolas", 10};
	//{L"Consolas", 7};
	//{L"Terminal", 2};
	bool bold = 0;
	font = CreateFont(
		-f.points*96/72,0,0,0,
		bold ? FW_BOLD : 0,		0,0,0,
		DEFAULT_CHARSET,		0,0,0,0,
		f.name);

	SIZE size = GetTextSize(font, &(wchar){'#'}, 1);
	cellwidth = size.cx;
	cellheight = size.cy;

	hwnd = CreateMainWindow();
	
	horz_sb = CreateWindow(L"SCROLLBAR", 0, WS_CHILD | SBS_HORZ, 0, 0, 0, 0, hwnd, 0, 0, 0); // note: not WS_VISIBLE
	vert_sb = CreateWindow(L"SCROLLBAR", 0, WS_CHILD | SBS_VERT, 0, 0, 0, 0, hwnd, 0, 0, 0);

	status      = CreateWindow(L"EDIT",   0,          WS_CHILD | WS_VISIBLE | ES_READONLY, 0, 0, 0, 0, hwnd, 0, 0, 0);

	inputlabel  = CreateWindow(L"STATIC", L"Input:",  WS_CHILD | WS_VISIBLE, 0, 0, 0, 0, hwnd, 0, 0, 0);
	input_wnd   = CreateWindow(L"EDIT",   0,          WS_CHILD | WS_VISIBLE | WS_BORDER | ES_READONLY, 0, 0, 0, 0, hwnd, 0, 0, 0);
	fifolabel   = CreateWindow(L"STATIC", L"FIFO:",   WS_CHILD | WS_VISIBLE, 0, 0, 0, 0, hwnd, 0, 0, 0);
	fifo_wnd    = CreateWindow(L"EDIT",   0,          WS_CHILD | WS_VISIBLE | WS_BORDER | ES_READONLY, 0, 0, 0, 0, hwnd, 0, 0, 0);
	outputlabel = CreateWindow(L"STATIC", L"Output:", WS_CHILD | WS_VISIBLE, 0, 0, 0, 0, hwnd, 0, 0, 0);
	output_wnd  = CreateWindow(L"EDIT",   0,          WS_CHILD | WS_VISIBLE | WS_BORDER | ES_READONLY | ES_MULTILINE | WS_VSCROLL, 0, 0, 0, 0, hwnd, 0, 0, 0);
	cheatsheet  = CreateWindow(L"STATIC", L"F5 - run, F10 or Space - step, s - reset, ESC - exit", WS_CHILD | WS_VISIBLE, 0, 0, 0, 0, hwnd, 0, 0, 0);

	SendMessage(input_wnd,  WM_SETFONT, (WPARAM)font, true);
	SendMessage(fifo_wnd,   WM_SETFONT, (WPARAM)font, true);
	SendMessage(output_wnd, WM_SETFONT, (WPARAM)font, true);

	// when main window is created it calls OnSize, but input_wnd/inputlabel/etc are not valid yet, so we have to force call OnSize again here
	OnSize(hwnd);

	ProcessArgs();

	MessageLoop();
}

LRESULT CALLBACK MainWindowProc(HWND, UINT, WPARAM, LPARAM);

void* CreateWindowClass()
{
	WNDCLASS wc = {0};
	wc.style = CS_HREDRAW | CS_VREDRAW;
	wc.lpfnWndProc = MainWindowProc;
	wc.lpszClassName = L"dobgui";
	wc.hCursor = LoadCursor(NULL, IDC_ARROW);
	RegisterClass(&wc);
	return (void*)wc.lpszClassName;
}

HWND CreateMainWindow()
{
	void* wndclass = CreateWindowClass();
	int style = WS_OVERLAPPEDWINDOW | WS_VISIBLE | WS_CLIPCHILDREN;
	int width = GetSystemMetrics(SM_CXSCREEN) - 100;
	int height = GetSystemMetrics(SM_CYSCREEN) - 100;
	
	HWND wnd = CreateWindow(wndclass, 0, style, 40, 30, width, height, 0, 0, 0, 0);

	return wnd;
}

void OnKeyDown( HWND hwnd, WPARAM wprm );

void PreTranslateMessage(MSG* msg)
{
	if(msg->message == WM_KEYDOWN)
		OnKeyDown(msg->hwnd, msg->wParam);
}


void MessageLoop()
{
	MSG msg;
	while( GetMessage(&msg,0,0,0) )
	{
		PreTranslateMessage(&msg);
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
}

void OnPaint(HWND hwnd);
void OnSize(HWND hwnd);
void OnKeyDown( HWND hwnd, WPARAM wParam );
void OnScroll(WPARAM wp, HWND scrollbar, int step);
void gui_step();

LRESULT CALLBACK MainWindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp)
{
	switch(msg)
	{
	case WM_PAINT:
		OnPaint(hwnd);
		break;

	case WM_SIZE:
		OnSize(hwnd);
		break;

	case WM_HSCROLL:
		OnScroll(wp, horz_sb, cellwidth + bdr);
		break;

	case WM_VSCROLL:
		OnScroll(wp, vert_sb, cellheight + bdr);
		break;

	case WM_CTLCOLORSTATIC:
		return (LRESULT)GetStockObject(WHITE_BRUSH);

	case WM_CLOSE:
		exit(0);

//	case WM_KEYDOWN:
//		OnKeyDown(hwnd, wp);
//		break;

	case WM_TIMER:
		gui_step(); // see OnKeyDown
		break;

	case WM_LBUTTONDOWN:
		SetFocus(hwnd);
		break;

	default:
		return DefWindowProc(hwnd, msg, wp, lp);
	}
	return 0;
}

void stop()
{
	if(!program_running) return;

	KillTimer(hwnd, 1);
	program_running = false;
}

void OnKeyDown( HWND hwnd, WPARAM wprm )
{
	if(wprm == VK_F10 || wprm == ' ')
	{
		if(state != NORMAL) return;

		if(program_running)
		{
			stop();
			return;
		}

		gui_step();
	}
	elif(wprm == VK_F5)
	{
		if(state != NORMAL) return;
		
		if(program_running)
		{
			stop();
		}
		else
		{
			SetTimer(hwnd, 1, 10, 0);
			program_running = true;
		}
	}
	if(wprm == 'S')
	{
		stop();

		if(filename)
		{
			LoadFile(filename);
			LoadInputFile();
		}
	}
	elif(wprm == VK_ESC)
	{
		exit(0);
	}
	//if(wp == VK_DOWN)
	//{
	//	//sb.pos += 10;
	//	RefreshWindow(hwnd);
	//}
	//elif(wp == VK_PAGEDOWN)
	//{
	//	RECT rect;
	//	GetClientRect(hwnd, &rect);
	//	//sb.pos += rect.bottom;
	//	RefreshWindow(hwnd);
	//}
}

void OnSize(HWND hwnd)
{
	RECT client;
	GetClientRect(hwnd, &client);
	int client_width = client.right;
	int client_height = client.bottom;
	int padding = 5;
	int labelwidth = 70;
	int fieldwidth = client_width - labelwidth - 2*padding;
	int statusheight = 24;
	int inputheight = 28;
	int fifoheight = 28;
	int outputheight = 28;
	int cheatsheetheight = 28;
	int adjust = 3;
	// starting from the bottom:
	int cheatsheet_y = client_height - padding - cheatsheetheight;
	int output_y = cheatsheet_y - padding - outputheight;
	int fifo_y = output_y - padding - fifoheight;
	int input_y = fifo_y - padding - inputheight;
	int status_y = input_y - padding - statusheight;

	MoveWindow(cheatsheet,  padding,  cheatsheet_y + adjust, client_width - 2*padding, cheatsheetheight, true);

	MoveWindow(outputlabel, padding,              output_y + adjust, labelwidth, outputheight, true);
	MoveWindow(output_wnd,  padding + labelwidth, output_y,          fieldwidth, outputheight, true);

	MoveWindow(fifolabel,   padding,              fifo_y + adjust,   labelwidth, fifoheight, true);
	MoveWindow(fifo_wnd,    padding + labelwidth, fifo_y,            fieldwidth, fifoheight, true);

	MoveWindow(inputlabel,  padding,              input_y + adjust,  labelwidth, inputheight, true);
	MoveWindow(input_wnd,   padding + labelwidth, input_y,           fieldwidth, inputheight, true);

	MoveWindow(status, padding, status_y, client_width - 2*padding, statusheight, true);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	tablewidth = bdr + (cellwidth+bdr)*width;
	tableheight = bdr + (cellheight+bdr)*height;
	tabletop = padding;
	tableleft = padding;

	bool horz_sb_present = false, vert_sb_present = false; // scrollbars
	int scrollbar_width = 18;
	int footer_height = client_height - (status_y - padding);

	// space availabel for code table:
	// x: client_width - 2*padding - scrollbar_width(optional, vert_sb)
	// y: client_height - 2*padding - footer_height - scrollbar_width(optional, horz_sb)
	avail_width = client_width - 2*padding; // first calc in assumption that vert sb is not present
	horz_sb_present = (tablewidth > avail_width);
	avail_height = client_height - 2*padding - footer_height - horz_sb_present * scrollbar_width;
	vert_sb_present = (tableheight > avail_height);
	if(vert_sb_present) // vert sb is present, recalc avail_width/avail_height
	{
		avail_width = client_width - 2*padding - scrollbar_width;
		horz_sb_present = (tablewidth > avail_width);
		avail_height = client_height - 2*padding - footer_height - horz_sb_present * scrollbar_width;
	}

	if(horz_sb_present)
	{
		int horz_sb_left = padding;
		int horz_sb_top = padding + avail_height;
		int horz_sb_width = avail_width;
		int horz_sb_height = scrollbar_width;
		MoveWindow(horz_sb, horz_sb_left, horz_sb_top, horz_sb_width, horz_sb_height, true);
		ShowWindow(horz_sb, SW_SHOW);

		SCROLLINFO si = {sizeof si};
		si.fMask = SIF_RANGE | SIF_PAGE;
		si.nMin = 0;
		si.nMax = tablewidth - 1; // inclusive, so -1
		si.nPage = avail_width;
		SetScrollInfo(horz_sb, SB_CTL, &si, true);
	}
	else
	{
		ShowWindow(horz_sb, SW_HIDE);
	}

	if(vert_sb_present)
	{
		int vert_sb_left = padding + avail_width;
		int vert_sb_top = padding;
		int vert_sb_width = scrollbar_width;
		int vert_sb_height = avail_height;
		MoveWindow(vert_sb, vert_sb_left, vert_sb_top, vert_sb_width, vert_sb_height, true);
		ShowWindow(vert_sb, SW_SHOW);

		SCROLLINFO si = {sizeof si};
		si.fMask = SIF_RANGE | SIF_PAGE;
		si.nMin = 0;
		si.nMax = tableheight - 1; // inclusive, so -1
		si.nPage = avail_height;
		SetScrollInfo(vert_sb, SB_CTL, &si, true);
	}
	else
	{
		ShowWindow(vert_sb, SW_HIDE);
	}
}


void FillSolidRect(HDC hdc, RECT rect, color_t color)
{
	// see WTL::CDC::FillSolidRect
	int tmp = SetBkColor(hdc, color);
	ExtTextOut(hdc, 0, 0, ETO_OPAQUE, &rect, 0, 0, 0);
	SetBkColor(hdc, tmp);
}

void DrawLine(HDC hdc, int x1, int y1, int x2, int y2 )
{
	MoveToEx(hdc, x1, y1, 0);
	LineTo(hdc, x2, y2);
	// LineTo doesn't draw last pixel
	//SetPixel(hdc, x2, y2, color);
}


void DrawCode(HDC hdc);

// C:\Users\stas\Projects\devenv-current\editor\Editor.cpp
void OnPaint(HWND hwnd)
{
	PAINTSTRUCT ps;
	BeginPaint(hwnd, &ps);
	RECT client;
	GetClientRect(hwnd, &client);

	HDC hdc = CreateCompatibleDC(ps.hdc);	// create memory dc
	HBITMAP bmp	= CreateCompatibleBitmap(ps.hdc, client.right, client.bottom);
	SelectObject(hdc, bmp);			// select bitmap into memdc

	FillSolidRect(hdc, client, White);

	DrawCode(hdc);

	BitBlt(ps.hdc, 0, 0, client.right, client.bottom,   hdc, 0, 0,   SRCCOPY);
	DeleteDC(hdc);
	DeleteObject(bmp); // not selected into memdc anymore, can be deleted

	EndPaint(hwnd, &ps);
}

// some fine-tuning of character position inside cell
// this is only for Courier New 12pt
void adjust_position(wchar ch, int* x, int* y)
{
	if(ch == '.' || ch == ',' || ch == ':') (*x)++;
}

void DrawCode(HDC hdc)
{
	SetBkMode(hdc, TRANSPARENT);
	SelectObject(hdc, font);

	IntersectClipRect(hdc, tableleft, tabletop, tableleft + avail_width, tabletop + avail_height);

	SelectObject(hdc, GetStockObject(DC_PEN));
	SetDCPenColor(hdc, Silver);

	int scroll_x = GetScrollPos(horz_sb, SB_CTL);
	int scroll_y = GetScrollPos(vert_sb, SB_CTL);

	if(bdr)
	{
		// draw horizontal lines
		for(int i=0; i <= height; i++) // note: <=
		{
			int y = tabletop - scroll_y + (cellheight+bdr)*i;
			DrawLine(hdc, tableleft, y, tableleft + tablewidth, y); // not avail_width because table may be smaller than that
		}
		// draw vertical lines
		for(int i=0; i <= width; i++) // note: <=
		{
			int x = tableleft - scroll_x + (cellwidth+bdr)*i;
			DrawLine(hdc, x, tabletop, x, tabletop + tableheight);
		}
	}
	
	//int x= GetTextAlign(hdc);TA_LEFT|TA_TOP
	//TextOut(hdc,padding+1,padding+1,&(wchar){'#'},1);
	
	// draw chars
	// this is a quick hack, frontends are not supposed to access code directly
	Slot* slot;
	RB_FOREACH(slot, Code, &code)
	{
		int x = slot->x;
		int y = slot->y;
		if(slot->cmd.type == NONE && slot->ndots == 0) continue;
		assert( (slot->cmd.type == NONE && slot->ndots == 1) || (slot->cmd.type != NONE && slot->ndots == 0) );

		wchar ch = slot->cmd.type != NONE ? slot->cmd.type : slot->dots[0].bit ? '.' : ',';
		
		int _x = tableleft - scroll_x + bdr + (cellwidth+bdr)*x;
		int _y = tabletop - scroll_y + bdr + (cellheight+bdr)*y;
		//adjust_position(ch, &_x, &_y);
		TextOut(hdc, _x, _y, &ch, 1);
	}
}

void OnScroll(WPARAM wp, HWND scrollbar, int step)
{
	SCROLLINFO si = {sizeof si, SIF_ALL};
	GetScrollInfo(scrollbar, SB_CTL, &si);

	switch(LOWORD(wp))
	{
	case SB_LINELEFT:
		//si.nPos -= step;
		si.nPos = shrink_aligned(si.nPos, step);
		break;
	case SB_LINERIGHT:
		//si.nPos += step;
		si.nPos = grow_aligned(si.nPos, step);
		break;
	case SB_PAGELEFT:
		si.nPos -= si.nPage;
		break;
	case SB_PAGERIGHT:
		si.nPos += si.nPage;
		break;
	case SB_THUMBTRACK:
		si.nPos = si.nTrackPos;
		break;
	}

	SetScrollPos(scrollbar, SB_CTL, si.nPos, true);
	RefreshWindow(hwnd);
}

void gui_step()
{
	step();
	if(state != NORMAL && program_running)
		stop();
	update_gui();
}