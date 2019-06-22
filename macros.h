#define byte unsigned char
#define bool char
#define false 0
#define true  1

#define elif else if
#define countof(a) ( sizeof(a) / sizeof(*(a)) )
#define c_assert(e) typedef char __c_assert__[(e)?1:-1]     // compile-time assertion
#ifndef assert
#define assert(e) ((e) ? 0 : __debugbreak())
#endif

#ifndef max
#define max(a,b) ((a)>(b)?(a):(b))
#endif