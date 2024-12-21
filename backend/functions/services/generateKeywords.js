/**
 * Generates an array of keywords from the given title and author.
 *
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 * @return {string[]} An array of unique keywords.
 */
function generateKeywords(title, author) {
  const titleKeywords = title.toLowerCase().split(" ");
  const authorKeywords = author.toLowerCase().split(" ");
  return [...new Set([...titleKeywords, ...authorKeywords])];
}

module.exports = generateKeywords;
