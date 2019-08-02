DOBELA interpreter code is in interpreter.c/interpreter.h  
There are 4 clients that use that code: tester, dobgui, dobcon, dobweb.  
tester and dobgui are currently unsupported, may not work or even compile.  
 - tester - is supposed to run tests from 'tests' folder, 
         test files are supposed to have format described in tests\test-format.txt,
         but currently majority of test files are just DOBELA programs that need to be run and checked manually
 - dobgui - win32 app
 - dobcon - console app, should work on Windows and Linux.
         dobcon is able to run [polyglot](https://codegolf.stackexchange.com/a/178900) in acceptable time
 - dobweb - online app at [stasoid.gihub.io/dobela](https://stasoid.github.io/dobela), transpiled to js with Emscripten.
         dobweb works good only for small programs, it runs [polyglot](https://codegolf.stackexchange.com/a/178900) very slowly

[DOBELA spec](spec.txt) - unfinished, based on [spec v13 at esolongs](https://esolangs.org/wiki/DOBELA).

[Implementation notes](impl.txt), [types of errors in interpreter](impl-errors.txt).