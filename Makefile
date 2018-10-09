
WORDLIST_FILES=$(shell find src/wordlists -maxdepth 1 -type f)

default: data.json

data.json: $(WORDLIST_FILES) src/wordlists/generate.sh
	src/wordlists/generate.sh
