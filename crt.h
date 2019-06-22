#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <memory.h>
#include <sys/stat.h>
#ifdef _MSC_VER
#define snprintf _snprintf
#endif

static void* memdup(void* ptr, int size)
{
	void* ret = malloc(size);
	memcpy(ret, ptr, size);
	return ret;
}

static int fsize(char* filename)
{
	struct stat st;
	if (stat(filename, &st) == 0)
		return st.st_size;
	return -1;
}

// adds null byte, but also optionally returns size
static char* readfile(char* fname, int* _size)
{
	FILE* f = fopen(fname, "rb"); if (!f) return 0;
	int size = fsize(fname); char* buf = calloc(size + 1, 1);
	fread(buf, 1, size, f); fclose(f);
	if(_size) *_size = size; return buf;
}
