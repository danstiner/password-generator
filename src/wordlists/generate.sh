#!/bin/bash

set -e

DIR="$(dirname "${BASH_SOURCE[0]}")"
WORDLISTS="$DIR/lists"
ROOTDIR="$DIR/../../"
TARGET="$ROOTDIR/javascripts/wordlists.js"
MODULE_NAME="wordlists"

clean() {
	cat | grep -Fvx -f "$DIR/swearWords.txt" -f "$DIR/disallowed_words.txt" | grep -v -e '[[:upper:]]'
}

to_js_array_element()
{
	prefix=$1
	while read -r string; do echo "$prefix\"${string/\"/\\\"}\""; done
}

write_wordlist()
{
	exportName=$1

	echo "  exports[\"$exportName\"] =" >> "$TARGET"
	read -r first_line
	echo "$first_line" | to_js_array_element "    [ " >> "$TARGET"
	cat | to_js_array_element "    , " >> "$TARGET"
	echo "  ];" >> "$TARGET"
}

regenerate_common_password_based_lists()
{
	cat "$DIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$DIR/googlebooks_ngram_adjectives.txt") \
	  > "$WORDLISTS/common_password_adjectives.txt"

	cat "$DIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$DIR/googlebooks_ngram_nouns.txt") \
	  > "$WORDLISTS/common_password_nouns.txt"

	cat "$DIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$DIR/googlebooks_ngram_verbs.txt") \
	  > "$WORDLISTS/common_password_verbs.txt"
}

write_wordlists()
{
	echo "'use strict';" > "$TARGET"
	echo "(function(exports) {" >> "$TARGET"

	# Write word lists as javascript variables
	find "$WORDLISTS" -maxdepth 1 -type f -name "*.txt" | while read -r filePath
	do
		fileName=$(basename "$filePath")
		name=${fileName%.*}
		cat $filePath | clean | write_wordlist "$name"
	done

	echo "})(this.$MODULE_NAME = {});" >> "$TARGET"
}
regenerate_common_password_based_lists
write_wordlists