
WORDLISTS=$(shell find src/wordlists -maxdepth 1 -type f -name "*.txt")

javascripts/wordlists.js: generate_wordlists.sh src/disallowed_words.txt src/swearWords.txt $(WORDLISTS)
	./generate_wordlists.sh
