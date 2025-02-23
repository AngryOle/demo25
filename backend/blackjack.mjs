// TRIE-STRUCTURE
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.data = null; 
    }
}

class BlackjackTrie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(playerName, gameState) {
        let node = this.root;
        for (const char of playerName) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.data = gameState;
    }

    search(playerName) {
        let node = this.root;
        for (const char of playerName) {
            if (!node.children[char]) {
                return null;
            }
            node = node.children[char];
        }
        return node.isEndOfWord ? node.data : null;
    }

    delete(playerName) {
        const deleteHelper = (node, name, depth = 0) => {
            if (depth === name.length) {
                if (!node.isEndOfWord) return false;
                node.isEndOfWord = false;
                return Object.keys(node.children).length === 0;
            }

            const char = name[depth];
            if (!node.children[char]) return false;

            const shouldDelete = deleteHelper(node.children[char], name, depth + 1);
            if (shouldDelete) delete node.children[char];

            return Object.keys(node.children).length === 0 && !node.isEndOfWord;
        };

        deleteHelper(this.root, playerName);
    }
}

export default BlackjackTrie;