#! /usr/bin/env node

var mongoDB = 'mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority';
var async = require('async')
var Symbol = require('../../../models/symbol')

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

function createSymbols(cb) {
  async.parallel([
    function(callback) { symbolCreate(0, "½", "fraction", "one half", callback); },
    function(callback) { symbolCreate(1, "⅓", "fraction", "one third", callback); },
    function(callback) { symbolCreate(2, "¼", "fraction", "one quarter", callback); },
    function(callback) { symbolCreate(3, "¾", "fraction", "three quarters", callback); },
    function(callback) { symbolCreate(4, "⅕", "fraction", "one fifth", callback); },
    function(callback) { symbolCreate(5, "⅙", "fraction", "one sixth", callback); },
    function(callback) { symbolCreate(6, "⅐", "fraction", "one seventh", callback); },
    function(callback) { symbolCreate(7, "⅛", "fraction", "one eighth", callback); },
    function(callback) { symbolCreate(8, "⅑", "fraction", "one ninth", callback); },
    function(callback) { symbolCreate(9, "⅒", "fraction", "one tenth", callback); },
    function(callback) { symbolCreate(10, "⅔", "fraction", "two thirds", callback); },
    function(callback) { symbolCreate(11, "⅖", "fraction", "two fifths", callback); },
    function(callback) { symbolCreate(12, "⅗", "fraction", "three fifths", callback); },
    function(callback) { symbolCreate(13, "⅘", "fraction", "four fifths", callback); },
    function(callback) { symbolCreate(14, "⅚", "fraction", "five sixths", callback); },
    function(callback) { symbolCreate(15, "⅜", "fraction", "three eighths", callback); },
    function(callback) { symbolCreate(16, "⅝", "fraction", "five eighths", callback); },
    function(callback) { symbolCreate(17, "⅞", "fraction", "seven eighths", callback); },
    function(callback) { symbolCreate(18, "⁺", "supersub", "superscript plus", callback); },
    function(callback) { symbolCreate(19, "⁻", "supersub", "superscript minus", callback); },
    function(callback) { symbolCreate(20, "⁼", "supersub", "superscript equals", callback); },
    function(callback) { symbolCreate(21, "⁽", "supersub", "superscript left parenthesis", callback); },
    function(callback) { symbolCreate(22, "⁾", "supersub", "superscript right parenthesis", callback); },
    function(callback) { symbolCreate(23, "⁰", "supersub", "superscript zero", callback); },
    function(callback) { symbolCreate(24, "¹", "supersub", "superscript one", callback); },
    function(callback) { symbolCreate(25, "²", "supersub", "superscript two", callback); },
    function(callback) { symbolCreate(26, "³", "supersub", "superscript three", callback); },
    function(callback) { symbolCreate(27, "⁴", "supersub", "superscript four", callback); },
    function(callback) { symbolCreate(28, "⁵", "supersub", "superscript five", callback); },
    function(callback) { symbolCreate(29, "⁶", "supersub", "superscript six", callback); },
    function(callback) { symbolCreate(30, "⁷", "supersub", "superscript seven", callback); },
    function(callback) { symbolCreate(31, "⁸", "supersub", "superscript eight", callback); },
    function(callback) { symbolCreate(32, "⁹", "supersub", "superscript nine", callback); },
    function(callback) { symbolCreate(33, "₊", "supersub", "subscript plus", callback); },
    function(callback) { symbolCreate(34, "₋", "supersub", "subscript minus", callback); },
    function(callback) { symbolCreate(35, "₌", "supersub", "subscript equals", callback); },
    function(callback) { symbolCreate(36, "₍", "supersub", "subscript left parenthesis", callback); },
    function(callback) { symbolCreate(37, "₎", "supersub", "subscript right parenthesis", callback); },
    function(callback) { symbolCreate(38, "₀", "supersub", "subscript zero", callback); },
    function(callback) { symbolCreate(39, "₁", "supersub", "subscript one", callback); },
    function(callback) { symbolCreate(40, "₂", "supersub", "subscript two", callback); },
    function(callback) { symbolCreate(41, "₃", "supersub", "subscript three", callback); },
    function(callback) { symbolCreate(42, "₄", "supersub", "subscript four", callback); },
    function(callback) { symbolCreate(43, "₅", "supersub", "subscript five", callback); },
    function(callback) { symbolCreate(44, "₆", "supersub", "subscript six", callback); },
    function(callback) { symbolCreate(45, "₇", "supersub", "subscript seven", callback); },
    function(callback) { symbolCreate(46, "₈", "supersub", "subscript eight", callback); },
    function(callback) { symbolCreate(47, "₉", "supersub", "subscript nine", callback); },
    function(callback) { symbolCreate(48, "ᵃ", "supersub", "superscript a", callback); },
    function(callback) { symbolCreate(49, "ᵇ", "supersub", "superscript b", callback); },
    function(callback) { symbolCreate(50, "ᶜ ", "supersub", "superscript c", callback); },
    function(callback) { symbolCreate(51, "ᵈ", "supersub", "superscript d", callback); },
    function(callback) { symbolCreate(52, "ᵉ", "supersub", "superscript e", callback); },
    function(callback) { symbolCreate(53, "ᶠ", "supersub", "superscript f", callback); },
    function(callback) { symbolCreate(54, "ᵍ", "supersub", "superscript g", callback); },
    function(callback) { symbolCreate(55, "ʰ", "supersub", "superscript h", callback); },
    function(callback) { symbolCreate(56, "ⁱ", "supersub", "superscript i", callback); },
    function(callback) { symbolCreate(57, "ʲ", "supersub", "superscript j", callback); },
    function(callback) { symbolCreate(58, "ᵏ", "supersub", "superscript k", callback); },
    function(callback) { symbolCreate(59, "ˡ", "supersub", "superscript l", callback); },
    function(callback) { symbolCreate(60, "ᵐ", "supersub", "superscript m", callback); },
    function(callback) { symbolCreate(61, "ⁿ", "supersub", "superscript n", callback); },
    function(callback) { symbolCreate(62, "ᵒ", "supersub", "superscript o", callback); },
    function(callback) { symbolCreate(63, "ᵖ", "supersub", "superscript p", callback); },
    function(callback) { symbolCreate(64, "ʳ", "supersub", "superscript r", callback); },
    function(callback) { symbolCreate(65, "ˢ", "supersub", "superscript s", callback); },
    function(callback) { symbolCreate(66, "ᵗ", "supersub", "superscript t", callback); },
    function(callback) { symbolCreate(67, "ᵘ", "supersub", "superscript u", callback); },
    function(callback) { symbolCreate(68, "ᵛ", "supersub", "superscript v", callback); },
    function(callback) { symbolCreate(69, "ʷ", "supersub", "superscript w", callback); },
    function(callback) { symbolCreate(70, "ˣ", "supersub", "superscript x", callback); },
    function(callback) { symbolCreate(71, "ʸ", "supersub", "superscript y", callback); },
    function(callback) { symbolCreate(72, "ᶻ", "supersub", "superscript z", callback); },
    function(callback) { symbolCreate(73, "ₐ", "supersub", "subscript a", callback); },
    function(callback) { symbolCreate(74, "ₑ", "supersub", "subscript e", callback); },
    function(callback) { symbolCreate(75, "ₕ", "supersub", "subscript h", callback); },
    function(callback) { symbolCreate(76, "ᵢ", "supersub", "subscript i", callback); },
    function(callback) { symbolCreate(77, "ⱼ", "supersub", "subscript j", callback); },
    function(callback) { symbolCreate(78, "ₖ", "supersub", "subscript k", callback); },
    function(callback) { symbolCreate(79, "ₗ", "supersub", "subscript l", callback); },
    function(callback) { symbolCreate(80, "ₘ", "supersub", "subscript m", callback); },
    function(callback) { symbolCreate(81, "ₙ", "supersub", "subscript n", callback); },
    function(callback) { symbolCreate(82, "ₒ", "supersub", "subscript o", callback); },
    function(callback) { symbolCreate(83, "ₚ", "supersub", "subscript p", callback); },
    function(callback) { symbolCreate(84, "ᵣ", "supersub", "subscript r", callback); },
    function(callback) { symbolCreate(85, "ₛ", "supersub", "subscript s", callback); },
    function(callback) { symbolCreate(86, "ₜ", "supersub", "subscript t", callback); },
    function(callback) { symbolCreate(87, "ᵤ", "supersub", "subscript u", callback); },
    function(callback) { symbolCreate(88, "ᵥ", "supersub", "subscript v", callback); },
    function(callback) { symbolCreate(89, "ₓ", "supersub", "subscript x", callback); },
    function(callback) { symbolCreate(90, "ₔ", "supersub", "subscript inverted e", callback); },
    function(callback) { symbolCreate(91, "°", "symbol", "degree sign", callback); },
    function(callback) { symbolCreate(92, "×", "symbol", "multiplication sign", callback); },
    function(callback) { symbolCreate(93, "÷", "symbol", "division sign", callback); },
    function(callback) { symbolCreate(94, "±", "symbol", "plus-minus sign = plus-or-minus sign", callback); },
    function(callback) { symbolCreate(95, "¡", "symbol", "inverted exclamation mark", callback); },
    function(callback) { symbolCreate(96, "¢", "symbol", "cent sign", callback); },
    function(callback) { symbolCreate(97, "¤", "symbol", "currency sign", callback); },
    function(callback) { symbolCreate(98, "¥", "symbol", "yen sign = yuan sign", callback); },
    function(callback) { symbolCreate(99, "¦", "symbol", "broken vertical bar", callback); },
    function(callback) { symbolCreate(100, "§", "symbol", "section sign", callback); },
    function(callback) { symbolCreate(101, "¨", "symbol", "diaeresis = spacing diaeresis", callback); },
    function(callback) { symbolCreate(102, "©", "symbol", "copyright sign", callback); },
    function(callback) { symbolCreate(103, "ª", "symbol", "feminine ordinal indicator", callback); },
    function(callback) { symbolCreate(104, "«", "symbol", "left-pointing double angle quotation mark = left pointing guillemet", callback); },
    function(callback) { symbolCreate(105, "®", "symbol", "registered sign = registered trademark sign", callback); },
    function(callback) { symbolCreate(106, "¯", "symbol", "macron = spacing macron = overline = APL overbar", callback); },
    function(callback) { symbolCreate(107, "´", "symbol", "acute accent = spacing acute", callback); },
    function(callback) { symbolCreate(108, "µ", "symbol", "micro sign", callback); },
    function(callback) { symbolCreate(109, "¶", "symbol", "pilcrow sign = paragraph sign", callback); },
    function(callback) { symbolCreate(110, "·", "symbol", "middle dot = Georgian comma = Greek middle dot", callback); },
    function(callback) { symbolCreate(111, "¸", "symbol", "cedilla = spacing cedilla", callback); },
    function(callback) { symbolCreate(112, "º", "symbol", "masculine ordinal indicator", callback); },
    function(callback) { symbolCreate(113, "»", "symbol", "right-pointing double angle quotation mark = right pointing guillemet", callback); },
    function(callback) { symbolCreate(114, "¿", "symbol", "inverted question mark = turned question mark", callback); },
    function(callback) { symbolCreate(115, "ƒ", "symbol", "latin small f with hook = function = florin", callback); },
    function(callback) { symbolCreate(116, "ˆ", "symbol", "modifier letter circumflex accent", callback); },
    function(callback) { symbolCreate(117, "˜", "symbol", "small tilde", callback); },
    function(callback) { symbolCreate(118, "–", "symbol", "en dash", callback); },
    function(callback) { symbolCreate(119, "—", "symbol", "em dash", callback); },
    function(callback) { symbolCreate(120, "‘", "symbol", "left single quotation mark", callback); },
    function(callback) { symbolCreate(121, "’", "symbol", "right single quotation mark", callback); },
    function(callback) { symbolCreate(122, "‚", "symbol", "single low-9 quotation mark", callback); },
    function(callback) { symbolCreate(123, "“", "symbol", "left double quotation mark", callback); },
    function(callback) { symbolCreate(124, "”", "symbol", "right double quotation mark", callback); },
    function(callback) { symbolCreate(125, "„", "symbol", "double low-9 quotation mark", callback); },
    function(callback) { symbolCreate(126, "†", "symbol", "dagger", callback); },
    function(callback) { symbolCreate(127, "‡", "symbol", "double dagger", callback); },
    function(callback) { symbolCreate(128, "•", "symbol", "bullet = black small circle", callback); },
    function(callback) { symbolCreate(129, "…", "symbol", "horizontal ellipsis = three dot leader", callback); },
    function(callback) { symbolCreate(130, "‰", "symbol", "per mille sign", callback); },
    function(callback) { symbolCreate(131, "′", "symbol", "prime = minutes = feet", callback); },
    function(callback) { symbolCreate(132, "″", "symbol", "double prime = seconds = inches", callback); },
    function(callback) { symbolCreate(133, "‹", "symbol", "single left-pointing angle quotation mark", callback); },
    function(callback) { symbolCreate(134, "›", "symbol", "single right-pointing angle quotation mark", callback); },
    function(callback) { symbolCreate(135, "‾", "symbol", "overline = spacing overscore", callback); },
    function(callback) { symbolCreate(136, "⁄", "symbol", "fraction slash", callback); },
    function(callback) { symbolCreate(137, "€", "symbol", "euro sign", callback); },
    function(callback) { symbolCreate(138, "ℑ", "symbol", "blackletter capital I = imaginary part", callback); },
    function(callback) { symbolCreate(139, "ℓ", "symbol", "script small L", callback); },
    function(callback) { symbolCreate(140, "№", "symbol", "numero sign", callback); },
    function(callback) { symbolCreate(141, "℘", "symbol", "script capital P = power set = Weierstrass p", callback); },
    function(callback) { symbolCreate(142, "ℜ", "symbol", "blackletter capital R = real part symbol", callback); },
    function(callback) { symbolCreate(143, "™", "symbol", "trademark sign", callback); },
    function(callback) { symbolCreate(144, "ℵ", "symbol", "alef symbol = first transfinite cardinal", callback); },
    function(callback) { symbolCreate(145, "∅", "symbol", "empty set = null set = diameter", callback); },
    function(callback) { symbolCreate(146, "∇", "symbol", "nabla = backward difference", callback); },
    function(callback) { symbolCreate(147, "⊕", "symbol", "circled plus = direct sum", callback); },
    function(callback) { symbolCreate(148, "⊗", "symbol", "circled times = vector product", callback); },
    function(callback) { symbolCreate(149, "⟨", "symbol", "left-pointing angle bracket = bra", callback); },
    function(callback) { symbolCreate(150, "⟩", "symbol", "right-pointing angle bracket = ket", callback); },
    function(callback) { symbolCreate(151, "◊", "symbol", "lozenge", callback); },
    function(callback) { symbolCreate(152, "♠", "symbol", "black spade suit", callback); },
    function(callback) { symbolCreate(153, "♣", "symbol", "black club suit = shamrock", callback); },
    function(callback) { symbolCreate(154, "♥", "symbol", "black heart suit = valentine", callback); },
    function(callback) { symbolCreate(155, "♦", "symbol", "black diamond suit", callback); },
    function(callback) { symbolCreate(156, "¬", "operator", "not sign", callback); },
    function(callback) { symbolCreate(157, "∀", "operator", "for all", callback); },
    function(callback) { symbolCreate(158, "∂", "operator", "partial differential", callback); },
    function(callback) { symbolCreate(159, "∃", "operator", "there exists", callback); },
    function(callback) { symbolCreate(160, "∈", "operator", "element of", callback); },
    function(callback) { symbolCreate(161, "∉", "operator", "not an element of", callback); },
    function(callback) { symbolCreate(162, "∋", "operator", "contains as member", callback); },
    function(callback) { symbolCreate(163, "∏", "operator", "n-ary product = product sign", callback); },
    function(callback) { symbolCreate(164, "∑", "operator", "n-ary sumation", callback); },
    function(callback) { symbolCreate(165, "√", "operator", "square root", callback); },
    function(callback) { symbolCreate(166, "∛", "operator", "cube root", callback); },
    function(callback) { symbolCreate(167, "∜", "operator", "fourth root", callback); },
    function(callback) { symbolCreate(168, "∝", "operator", "proportional to", callback); },
    function(callback) { symbolCreate(169, "∞", "operator", "infinity", callback); },
    function(callback) { symbolCreate(170, "∠", "operator", "angle", callback); },
    function(callback) { symbolCreate(171, "∧", "operator", "logical and = wedge", callback); },
    function(callback) { symbolCreate(172, "∨", "operator", "logical or = vee", callback); },
    function(callback) { symbolCreate(173, "∩", "operator", "intersection = cap", callback); },
    function(callback) { symbolCreate(174, "∪", "operator", "union = cup", callback); },
    function(callback) { symbolCreate(175, "∫", "operator", "integral", callback); },
    function(callback) { symbolCreate(176, "∴", "operator", "therefore", callback); },
    function(callback) { symbolCreate(177, "∼", "operator", "tilde operator = varies with = similar to", callback); },
    function(callback) { symbolCreate(178, "≅", "operator", "approximately equal to", callback); },
    function(callback) { symbolCreate(179, "≈", "operator", "almost equal to = asymptotic to", callback); },
    function(callback) { symbolCreate(180, "≠", "operator", "not equal to", callback); },
    function(callback) { symbolCreate(181, "≡", "operator", "identical to", callback); },
    function(callback) { symbolCreate(182, "≤", "operator", "less-than or equal to", callback); },
    function(callback) { symbolCreate(183, "≥", "operator", "greater-than or equal to", callback); },
    function(callback) { symbolCreate(184, "⊂", "operator", "subset of", callback); },
    function(callback) { symbolCreate(185, "⊃", "operator", "superset of", callback); },
    function(callback) { symbolCreate(186, "⊄", "operator", "not a subset of", callback); },
    function(callback) { symbolCreate(187, "⊆", "operator", "subset of or equal to", callback); },
    function(callback) { symbolCreate(188, "⊇", "operator", "superset of or equal to", callback); },
    function(callback) { symbolCreate(189, "⋅", "operator", "dot operator", callback); },
    function(callback) { symbolCreate(190, "⊥", "shape", "up tack = orthogonal to = perpendicular", callback); },
    function(callback) { symbolCreate(191, "⌈", "shape", "left ceiling = apl upstile", callback); },
    function(callback) { symbolCreate(192, "⌉", "shape", "right ceiling", callback); },
    function(callback) { symbolCreate(193, "⌊", "shape", "left floor = apl downstile", callback); },
    function(callback) { symbolCreate(194, "⌋", "shape", "right floor", callback); },
    function(callback) { symbolCreate(195, "←", "arrow", "leftwards arrow", callback); },
    function(callback) { symbolCreate(196, "↑", "arrow", "upwards arrow", callback); },
    function(callback) { symbolCreate(197, "→", "arrow", "rightwards arrow", callback); },
    function(callback) { symbolCreate(198, "↓", "arrow", "downwards arrow", callback); },
    function(callback) { symbolCreate(199, "↔", "arrow", "left right arrow", callback); },
    function(callback) { symbolCreate(200, "↵", "arrow", "downwards arrow with corner leftwards = carriage return", callback); },
    function(callback) { symbolCreate(201, "⇐", "arrow", "leftwards double arrow", callback); },
    function(callback) { symbolCreate(202, "⇑", "arrow", "upwards double arrow", callback); },
    function(callback) { symbolCreate(203, "⇒", "arrow", "rightwards double arrow", callback); },
    function(callback) { symbolCreate(204, "⇓", "arrow", "downwards double arrow", callback); },
    function(callback) { symbolCreate(205, "⇔", "arrow", "left right double arrow", callback); },
    function(callback) { symbolCreate(206, "↕", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(207, "↖", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(208, "↗", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(209, "↘", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(210, "↙", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(211, "↚", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(212, "↛", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(213, "↜", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(214, "↝", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(215, "↞", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(216, "↟", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(217, "↠", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(218, "↡", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(219, "↢", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(220, "↣", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(221, "↤", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(222, "↥", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(223, "↦", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(224, "↧", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(225, "↨", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(226, "↩", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(227, "↪", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(228, "↫", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(229, "↬", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(230, "↭", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(231, "↮", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(232, "↯", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(233, "↰", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(234, "↱", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(235, "↲", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(236, "↳", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(237, "↴", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(238, "↵", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(239, "↶", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(240, "↷", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(241, "↸", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(242, "↹", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(243, "↺", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(244, "↻", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(245, "↼", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(246, "↽", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(247, "↾", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(248, "↿", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(249, "⇀", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(250, "⇁", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(251, "⇂", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(252, "⇃", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(253, "⇄", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(254, "⇅", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(255, "⇆", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(256, "⇇", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(257, "⇈", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(258, "⇉", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(259, "⇊", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(260, "⇋", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(261, "⇌", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(262, "⇍", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(263, "⇎", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(264, "⇏", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(265, "⇐", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(266, "⇑", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(267, "⇒", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(268, "⇓", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(269, "⇔", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(270, "⇕", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(271, "⇖", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(272, "⇗", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(273, "⇘", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(274, "⇙", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(275, "⇚", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(276, "⇛", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(277, "⇜", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(278, "⇝", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(279, "⇞", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(280, "⇟", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(281, "⇠", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(282, "⇡", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(283, "⇢", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(284, "⇣", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(285, "⇤", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(286, "⇥", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(287, "⇦", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(288, "⇧", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(289, "⇨", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(290, "⇩", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(291, "⇪", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(292, "⇫", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(293, "⇬", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(294, "⇭", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(295, "⇮", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(296, "⇯", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(297, "⇰", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(298, "⇱", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(299, "⇲", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(300, "⇳", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(301, "⇴", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(302, "⇵", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(303, "⇶", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(304, "⇷", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(305, "⇸", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(306, "⇹", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(307, "⇺", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(308, "⇻", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(309, "⇽", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(310, "⇾", "arrow", "arrow", callback); },
    function(callback) { symbolCreate(311, "⇿", "arrow", "arrow", callback); },  ],
  cb);
}

async.series([
    createSymbols,
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