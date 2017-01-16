
WORDLISTS=$(shell find src/wordlists -maxdepth 1 -type f -name "*.txt")

javascripts/wordlists.js: generate_wordlists.sh $(WORDLISTS)
	./generate_wordlists.sh
