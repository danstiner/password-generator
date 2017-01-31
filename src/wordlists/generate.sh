#!/bin/bash
set -e

SOURCEDIR="$(dirname "${BASH_SOURCE[0]}")"
WORDLISTS="$SOURCEDIR/lists"
ROOTDIR="$SOURCEDIR/../../"
TARGET="$ROOTDIR/javascripts/wordlists.js"
MODULE_NAME="wordlists"

clean() {
	cat | grep -Fvx -f "$SOURCEDIR/swearWords.txt" -f "$SOURCEDIR/disallowed_words.txt" | grep -v -e '[[:upper:]]'
}

to_js_array_element()
{
	prefix=$1
	while read -r string; do echo "$prefix\"${string/\"/\\\"}\""; done
}

write_wordlist()
{
	output=$1
	exportName=$2

	echo "  exports[\"$exportName\"] =" >> "$TARGET"
	read -r first_line
	echo "$first_line" | to_js_array_element "    [ " >> "$TARGET"
	cat | to_js_array_element "    , " >> "$TARGET";
	echo "  ];" >> "$TARGET"
}

regenerate_common_password_based_lists()
{
	cat "$SOURCEDIR/10_million_password_list_top_10000.txt" \
	  | comm -12 <(sort >()) <(sort "$SOURCEDIR/2+2+3cmn.txt") \
	  > "$WORDLISTS/common_passwords.txt"

	cat "$SOURCEDIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$WORDLISTS/googlebooks_ngram_adjectives.txt") \
	  > "$WORDLISTS/common_password_adjectives.txt"

	cat "$SOURCEDIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$WORDLISTS/googlebooks_ngram_nouns.txt") \
	  > "$WORDLISTS/common_password_nouns.txt"

	cat "$SOURCEDIR/10_million_password_list_top_100000.txt" \
	  | comm -12 <(sort >()) <(sort "$WORDLISTS/googlebooks_ngram_verbs.txt") \
	  > "$WORDLISTS/common_password_verbs.txt"
}

write_wordlists()
{
	output=$1
	moduleName=$2
	sourceDirectory=$3

	echo "(function(exports) {" > "$output"

	# Write word lists as javascript variables
	find "$sourceDirectory" -maxdepth 1 -type f -name "*.txt" | while read -r filePath;
	do
		fileName=$(basename "$filePath")
		name=${fileName%.*}
		cat $filePath | clean | write_wordlist "$output" "$name"
	done

	echo "})(this.$moduleName = {});" >> "$output"
}

regenerate_common_password_based_lists
write_wordlists "$TARGET" "$MODULE_NAME" "$WORDLISTS"
