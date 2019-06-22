@emcc dobweb.c   -o dobweb.js    -Wno-comment  -Wno-unused-value  -Wno-pointer-sign  -Wno-typedef-redefinition  ^
      -s EXPORTED_FUNCTIONS="['_loadcode','_step','_getstate']"  -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall','cwrap']"  ^
      && del dobweb.js.map
