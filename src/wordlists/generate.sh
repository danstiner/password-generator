#!/bin/bash

set -e

DIR="$(dirname "${BASH_SOURCE[0]}")"
WORDLISTS="$DIR/lists"
ROOTDIR="$DIR/../../"
TARGET="$ROOTDIR/data.json"
MODULE_NAME="wordlists"

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
	echo '{' > "$TARGET"

	find "$WORDLISTS" -maxdepth 1 -type f -name "*.txt" | while read -r filePath
	do
		fileName=$(basename "$filePath")
		name=${fileName%.*}
		cat $filePath | clean | write_wordlist "$name"
	done

	echo '  "": []' >> "$TARGET"
	echo '}' >> "$TARGET"
	echo '' >> "$TARGET"
}

clean() {
	cat | grep -Fvx -f "$DIR/swearWords.txt" -f "$DIR/disallowed_words.txt" | grep -v -e '[[:upper:]]'
}

write_wordlist()
{
	exportName=$1

	echo "  \"$exportName\": [" >> "$TARGET"
	cat | while read -r line; do echo "    \"${line/\"/\\\"}\","; done | sed '$s/,/ /' >> "$TARGET"
	echo '  ],' >> "$TARGET"
}

regenerate_common_password_based_lists
write_wordlists