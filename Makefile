
WORDLIST_FILES=$(shell find src/wordlists -maxdepth 1 -type f)

javascripts/wordlists.js: $(WORDLIST_FILES)
	src/wordlists/generate.sh
