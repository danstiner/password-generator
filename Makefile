
WORDLIST_FILES=$(shell find src/wordlists -maxdepth 1 -type f)

default: javascripts/wordlists.js

javascripts/wordlists.js: $(WORDLIST_FILES) src/wordlists/generate.sh
	src/wordlists/generate.sh
