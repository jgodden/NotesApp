#! /usr/bin/env node

var mongoDB = 'mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority';
var async = require('async')
var Symbol = require('./models/symbol')

console.log('in populateSymbolSelect');
var mongoose = require('mongoose');
console.log('connect to ' + mongoDB);
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log('connected');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var symbols = []

function symbolCreate(index, char, type, description, cb) {
  symboldetail = {
    index: index,
    char: char,
    type: type,
    description: description
    }
    
  var symbol = new Symbol(symboldetail);    
  symbol.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Symbol: ' + symbol);
    symbols.push(symbol)
    cb(null, symbol)
  }  );
}

function createNumberSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(1, "¹", "number", "superscript one = superscript digit one", callback); },
    function(callback) { symbolCreate(2, "²", "number", "superscript two = superscript digit two = squared", callback); },
    function(callback) { symbolCreate(3, "³", "number", "superscript three = superscript digit three = cubed", callback); },
  ],
  cb);
}
function createFractionSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(1, "½", "fraction", "vulgar fraction one half = fraction one half", callback); },
    function(callback) { symbolCreate(2, "¼", "fraction", "vulgar fraction one quarter = fraction one quarter", callback); },
    function(callback) { symbolCreate(3, "¾", "fraction", "vulgar fraction three quarters = fraction three quarters", callback); },
  ],
  cb);
}
function createShapeSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(1, "⌈", "shape", "left ceiling = apl upstile", callback); },
    function(callback) { symbolCreate(2, "⌉", "shape", "right ceiling", callback); },
    function(callback) { symbolCreate(3, "⌊", "shape", "left floor = apl downstile", callback); },
    function(callback) { symbolCreate(4, "⌋", "shape", "right floor", callback); },
    function(callback) { symbolCreate(5, "‾", "shape", "overline = spacing overscore", callback); },
    function(callback) { symbolCreate(6, "–", "shape", "en dash", callback); },
    function(callback) { symbolCreate(7, "—", "shape", "em dash", callback); },
    function(callback) { symbolCreate(8, "⊥", "shape", "up tack = orthogonal to = perpendicular", callback); },
  ],
  cb);
}
function createOperatorSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(1, "∀", "operator", "for all", callback); },
    function(callback) { symbolCreate(2, "∂", "operator", "partial differential", callback); },
    function(callback) { symbolCreate(3, "∃", "operator", "there exists", callback); },
    function(callback) { symbolCreate(4, "∅", "operator", "empty set = null set = diameter", callback); },
    function(callback) { symbolCreate(5, "∇", "operator", "nabla = backward difference", callback); },
    function(callback) { symbolCreate(6, "∈", "operator", "element of", callback); },
    function(callback) { symbolCreate(7, "∉", "operator", "not an element of", callback); },
    function(callback) { symbolCreate(8, "∋", "operator", "contains as member", callback); },
    function(callback) { symbolCreate(9, "∏", "operator", "n-ary product = product sign", callback); },
    function(callback) { symbolCreate(10, "∑", "operator", "n-ary sumation", callback); },
    function(callback) { symbolCreate(12, "√", "operator", "square root = radical sign", callback); },
    function(callback) { symbolCreate(13, "∝", "operator", "proportional to", callback); },
    function(callback) { symbolCreate(14, "∞", "operator", "infinity", callback); },
    function(callback) { symbolCreate(15, "∠", "operator", "angle", callback); },
    function(callback) { symbolCreate(16, "∧", "operator", "logical and = wedge", callback); },
    function(callback) { symbolCreate(17, "∨", "operator", "logical or = vee", callback); },
    function(callback) { symbolCreate(18, "∩", "operator", "intersection = cap", callback); },
    function(callback) { symbolCreate(19, "∪", "operator", "union = cup", callback); },
    function(callback) { symbolCreate(20, "∫", "operator", "integral", callback); },
    function(callback) { symbolCreate(21, "∴", "operator", "therefore", callback); },
    function(callback) { symbolCreate(22, "∼", "operator", "tilde operator = varies with = similar to", callback); },
    function(callback) { symbolCreate(23, "≅", "operator", "approximately equal to", callback); },
    function(callback) { symbolCreate(24, "≈", "operator", "almost equal to = asymptotic to", callback); },
    function(callback) { symbolCreate(25, "≠", "operator", "not equal to", callback); },
    function(callback) { symbolCreate(26, "≡", "operator", "identical to", callback); },
    function(callback) { symbolCreate(27, "≤", "operator", "less-than or equal to", callback); },
    function(callback) { symbolCreate(28, "≥", "operator", "greater-than or equal to", callback); },
    function(callback) { symbolCreate(29, "⊂", "operator", "subset of", callback); },
    function(callback) { symbolCreate(30, "⊃", "operator", "superset of", callback); },
    function(callback) { symbolCreate(31, "⊄", "operator", "not a subset of", callback); },
    function(callback) { symbolCreate(32, "⊆", "operator", "subset of or equal to", callback); },
    function(callback) { symbolCreate(33, "⊇", "operator", "superset of or equal to", callback); },
    function(callback) { symbolCreate(34, "⋅", "operator", "dot operator", callback); },
  ],
  cb);
}
function createArrowSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(75, "←", "arrow", "leftwards arrow", callback); },
    function(callback) { symbolCreate(76, "↑", "arrow", "upwards arrow", callback); },
    function(callback) { symbolCreate(77, "→", "arrow", "rightwards arrow", callback); },
    function(callback) { symbolCreate(78, "↓", "arrow", "downwards arrow", callback); },
    function(callback) { symbolCreate(79, "↔", "arrow", "left right arrow", callback); },
    function(callback) { symbolCreate(80, "↵", "arrow", "downwards arrow with corner leftwards = carriage return", callback); },
    function(callback) { symbolCreate(81, "⇐", "arrow", "leftwards double arrow", callback); },
    function(callback) { symbolCreate(82, "⇑", "arrow", "upwards double arrow", callback); },
    function(callback) { symbolCreate(83, "⇒", "arrow", "rightwards double arrow", callback); },
    function(callback) { symbolCreate(84, "⇓", "arrow", "downwards double arrow", callback); },
    function(callback) { symbolCreate(85, "⇔", "arrow", "left right double arrow", callback); },
  ],
  cb);
}
function createSymbolSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(5, "¡", "symbol", "inverted exclamation mark", callback); },
    function(callback) { symbolCreate(6, "¢", "symbol", "cent sign", callback); },
    function(callback) { symbolCreate(7, "£", "symbol", "pound sign", callback); },
    function(callback) { symbolCreate(8, "¤", "symbol", "currency sign", callback); },
    function(callback) { symbolCreate(9, "¥", "symbol", "yen sign = yuan sign", callback); },
    function(callback) { symbolCreate(10, "¦", "symbol", "broken vertical bar", callback); },
    function(callback) { symbolCreate(11, "§", "symbol", "section sign", callback); },
    function(callback) { symbolCreate(12, "¨", "symbol", "diaeresis = spacing diaeresis", callback); },
    function(callback) { symbolCreate(13, "©", "symbol", "copyright sign", callback); },
    function(callback) { symbolCreate(14, "ª", "symbol", "feminine ordinal indicator", callback); },
    function(callback) { symbolCreate(15, "«", "symbol", "left-pointing double angle quotation mark = left pointing guillemet", callback); },
    function(callback) { symbolCreate(16, "¬", "symbol", "not sign", callback); },
    function(callback) { symbolCreate(17, "­", "symbol", "soft hyphen = discretionary hyphen", callback); },
    function(callback) { symbolCreate(18, "®", "symbol", "registered sign = registered trademark sign", callback); },
    function(callback) { symbolCreate(19, "¯", "symbol", "macron = spacing macron = overline = APL overbar", callback); },
    function(callback) { symbolCreate(20, "°", "symbol", "degree sign", callback); },
    function(callback) { symbolCreate(21, "±", "symbol", "plus-minus sign = plus-or-minus sign", callback); },
    function(callback) { symbolCreate(24, "´", "symbol", "acute accent = spacing acute", callback); },
    function(callback) { symbolCreate(25, "µ", "symbol", "micro sign", callback); },
    function(callback) { symbolCreate(26, "¶", "symbol", "pilcrow sign = paragraph sign", callback); },
    function(callback) { symbolCreate(27, "·", "symbol", "middle dot = Georgian comma = Greek middle dot", callback); },
    function(callback) { symbolCreate(28, "¸", "symbol", "cedilla = spacing cedilla", callback); },
    function(callback) { symbolCreate(30, "º", "symbol", "masculine ordinal indicator", callback); },
    function(callback) { symbolCreate(31, "»", "symbol", "right-pointing double angle quotation mark = right pointing guillemet", callback); },
    function(callback) { symbolCreate(35, "¿", "symbol", "inverted question mark = turned question mark", callback); },
    function(callback) { symbolCreate(36, "×", "symbol", "multiplication sign", callback); },
    function(callback) { symbolCreate(37, "÷", "symbol", "division sign", callback); },
    function(callback) { symbolCreate(38, "ƒ", "symbol", "latin small f with hook = function = florin", callback); },
    function(callback) { symbolCreate(39, "ˆ", "symbol", "modifier letter circumflex accent", callback); },
    function(callback) { symbolCreate(40, "˜", "symbol", "small tilde", callback); },
    function(callback) { symbolCreate(50, "‘", "symbol", "left single quotation mark", callback); },
    function(callback) { symbolCreate(51, "’", "symbol", "right single quotation mark", callback); },
    function(callback) { symbolCreate(52, "‚", "symbol", "single low-9 quotation mark", callback); },
    function(callback) { symbolCreate(53, "“", "symbol", "left double quotation mark", callback); },
    function(callback) { symbolCreate(54, "”", "symbol", "right double quotation mark", callback); },
    function(callback) { symbolCreate(55, "„", "symbol", "double low-9 quotation mark", callback); },
    function(callback) { symbolCreate(56, "†", "symbol", "dagger", callback); },
    function(callback) { symbolCreate(57, "‡", "symbol", "double dagger", callback); },
    function(callback) { symbolCreate(58, "•", "symbol", "bullet = black small circle", callback); },
    function(callback) { symbolCreate(59, "…", "symbol", "horizontal ellipsis = three dot leader", callback); },
    function(callback) { symbolCreate(60, "‰", "symbol", "per mille sign", callback); },
    function(callback) { symbolCreate(61, "′", "symbol", "prime = minutes = feet", callback); },
    function(callback) { symbolCreate(62, "″", "symbol", "double prime = seconds = inches", callback); },
    function(callback) { symbolCreate(63, "‹", "symbol", "single left-pointing angle quotation mark", callback); },
    function(callback) { symbolCreate(64, "›", "symbol", "single right-pointing angle quotation mark", callback); },
    function(callback) { symbolCreate(67, "€", "symbol", "euro sign", callback); },
    function(callback) { symbolCreate(68, "ℑ", "symbol", "blackletter capital I = imaginary part", callback); },
    function(callback) { symbolCreate(69, "ℓ", "symbol", "script small L", callback); },
    function(callback) { symbolCreate(70, "№", "symbol", "numero sign", callback); },
    function(callback) { symbolCreate(71, "℘", "symbol", "script capital P = power set = Weierstrass p", callback); },
    function(callback) { symbolCreate(72, "ℜ", "symbol", "blackletter capital R = real part symbol", callback); },
    function(callback) { symbolCreate(73, "™", "symbol", "trademark sign", callback); },
    function(callback) { symbolCreate(74, "ℵ", "symbol", "alef symbol = first transfinite cardinal", callback); },
    function(callback) { symbolCreate(120, "⊕", "symbol", "circled plus = direct sum", callback); },
    function(callback) { symbolCreate(121, "⊗", "symbol", "circled times = vector product", callback); },
    function(callback) { symbolCreate(128, "⟨", "symbol", "left-pointing angle bracket = bra", callback); },
    function(callback) { symbolCreate(129, "⟩", "symbol", "right-pointing angle bracket = ket", callback); },
    function(callback) { symbolCreate(130, "◊", "symbol", "lozenge", callback); },
    function(callback) { symbolCreate(131, "♠", "symbol", "black spade suit", callback); },
    function(callback) { symbolCreate(132, "♣", "symbol", "black club suit = shamrock", callback); },
    function(callback) { symbolCreate(133, "♥", "symbol", "black heart suit = valentine", callback); },
    function(callback) { symbolCreate(134, "♦", "symbol", "black diamond suit", callback); },
  ],
  cb);
}

async.series([
    createNumberSymbols,
    createFractionSymbols,
    createShapeSymbols,
    createSymbolSymbols,
    createOperatorSymbols,
    createArrowSymbols,
  ],
  function(err, results) {
      if (err) {
          console.log('FINAL ERR: '+ err);
      }
      else {
          console.log('Symbols: '+ symbols);
          
      }
      mongoose.connection.close();
  });
