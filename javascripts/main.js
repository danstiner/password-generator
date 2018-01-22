window.onload = () => {
  var wordCountElems = document.querySelectorAll("#passphrase_generation_symbol_counts a");
  for (var i = 0; i < wordCountElems.length; i++) {
    wordCountElems[i].addEventListener("click", passphrase_generator.onChangeWordCount);
  }

  var wordListElems = document.querySelectorAll("#passphrase_generation_wordlists a");
  for (var i = 0; i < wordListElems.length; i++) {
    wordListElems[i].addEventListener("click", passphrase_generator.onChangeWordlist);
  }

  document.getElementById('generated_passphrase').addEventListener("click", passphrase_generator.selectNodeContents);

  passphrase_generator.run();
};
