
swearWords.txt from http://www.bannedwordlist.com/

password lists from https://github.com/danielmiessler/SecLists/tree/master/Passwords

2+2+3cmn.txt from http://wordlist.aspell.net/12dicts-readme/#223cmn

Command to generate word list:
cat ./10_million_password_list_top_10000.txt | comm -12 <(sort >()) <(sort "./2+2+3cmn.txt")| 
grep -Fv -f swearWords.txt | grep -v -e '[[:upper:]]' > sanitized_commond_password_wordlist.txt