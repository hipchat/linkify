link = {
  // Static values used in creating the URL regexes
  RE_EMAIL_PATTERN: '\\b[\\w.-]+\\+*[\\w.-]+@(?:(?:[\\w-]+\\.)+[A-Za-z]{2,6}|(?:\\d{1,3}\\.){3}\\d{1,3})',
  RE_TLD: '(?:aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)',
  RE_URL_MIDCHAR: '[\\w\\.,@?^=%*"&,:;/~\+#\'|-]',  // characters allowed in URL center
  RE_URL_ENDCHAR: '[\\w@?^=%&/~\+#-]',              // URL must end with one of these chars
  RE_URL_SCHEME: '(?:http|ftp|https|news|mms)://',  // protocol
    
  // Text to turn in to emoticon images
  // "8)" must have a non-word character before it to protect "(2007-2008)" case
  emoticons: [
    {regex: ':-?D',     shortcut: ':D',   width: 18,  height: 18,    image: 'bigsmile.png'},
    {regex: ':-?o',     shortcut: ':o',   width: 18,  height: 18,    image: 'gasp.png'},
    {regex: ':-?p',     shortcut: ':p',   width: 18,  height: 18,    image: 'tongue.png'},
    {regex: '8-?\\)',   shortcut: '8)',   width: 18,  height: 18,    image: 'cool.png'},
    {regex: ':-?\\(',   shortcut: ':(',   width: 18,  height: 18,    image: 'frown.png'},
    {regex: ':-\\*',    shortcut: ':-*',  width: 18,  height: 18,    image: 'kiss.png'},
    {regex: ':\\\\',    shortcut: ':\\',  width: 18,  height: 18,    image: 'slant.png'},
    {regex: ':-?\\)',   shortcut: ':)',   width: 18,  height: 18,    image: 'smile.png'},
    {regex: ':-?\\|',   shortcut: ':|',   width: 18,  height: 18,    image: 'straightface.png'},
    {regex: ';-?\\)',   shortcut: ';)',   width: 18,  height: 18,    image: 'wink.png'}
  ],

  // Intialize the linkification variables
  // Call this before calling linkify(...)
  init: function() {
    this.RE_URL_ENDING = '(?:'+this.RE_URL_MIDCHAR+'*(?:\\('+this.RE_URL_MIDCHAR+'*\\)'+this.RE_URL_ENDCHAR+'*|'+this.RE_URL_ENDCHAR+'))?';
    this.RE_FULL_URL = this.RE_URL_SCHEME+'\\w+(?:.\\w+)'+this.RE_URL_ENDING;
    this.RE_OTHER_URL = '\\w[\\w_-]*(?:\\.\\w[\\w_-]*)*\\.'+this.RE_TLD+'(?:\\/'+this.RE_URL_ENDING+')?\\b';
  },
  
  /**
   * Add an word-based emoticon to the list of emoticons to check for
   *
   * @param filename - Name of the image file (the full path is created in the emoticon_text function)
   * @param shortcut - Text used to create the emoticon (e.g. "embarrassed" or "puking" )
   * @param height - Height in pixels of the image
   * @param width - Width in pixels of the image
   **/
  add_emoticon: function(filename, shortcut, height, width) {
    var emoticon_data = {
      image: filename,
      shortcut: shortcut,
      height: height,
      width: width,
      regex: '\\('+shortcut+'\\)',
      shortcut: '('+shortcut+')'
    };
    this.emoticons.push(emoticon_data);
  },
    
  /**
   * Linkify a string, replacing text urls with <a href="url">url</a>
   * Note: init must be called before this function can be used
   *
   * @param text - String to be linkified
   * @param emoticonify - Whether to replace text emoticons with images
   * @param matched_links - Return param (pass by ref) - Array of links matched during linkification
   **/
  linkify: function(text, emoticonify, truncate_length, matched_links) {
    if (typeof emoticonify == 'undefined') {
      emoticonify = true;
    }
    
    if (typeof matched_links == 'undefined') {
      match_and_replace = [];
    }
    
    text = this.match_and_replace(this.RE_EMAIL_PATTERN, text, false, false, truncate_length, matched_links);
    text = this.match_and_replace(this.RE_FULL_URL, text, true, false, truncate_length, matched_links);
    text = this.match_and_replace(this.RE_OTHER_URL, text, true, true, truncate_length, matched_links);
    
    if (emoticonify) {
      text = this.emoticon_text(text);
    }
      
    return text;
  },
  
  /**
   * Internal helper function for linkification
   **/
  match_and_replace: function(pattern, input, is_url, add_http, truncate_length, matched_links) {
    if (typeof add_http == 'undefined') {
      add_http = true;
    }
    
    var start = 0;
    var offset = 0;
    var match_length = 0;
    var end_tag_pos = 0;
    var close_anchor_re = /<\/[aA]>/;
    var re = new RegExp(pattern, "g");
    
    var match = {};
    var max_iter = 20;
    var cur_iter = 0;
    while (match = re.exec(input)) {
      cur_iter++;
      if (cur_iter > max_iter)
        break;
      
      start = match.index; // start of match
      match_length = match[0].length;

      // If we find an opening a tag, advance to its end and continue looking
      var substr = input.substring(offset, start);
      if (substr.search(/<[aA]/) >= 0) {
        close_anchor_re.lastIndex = offset;
        var close_anchor_pos = input.substring(offset, input.length).search(close_anchor_re);
        
        // If we find an opening tag without a matching closing tag, just return the input we have
        if (close_anchor_pos < 0)
          return input;
          
        end_tag_pos = close_anchor_pos + offset;

        // RegExp.lastIndex is used to tell the regexp where to start matching
        re.lastIndex = end_tag_pos + 4;
        offset = end_tag_pos + 4;
        
        continue;
      }

      // Do the actual replecement of text with anchor tag
      var address = input.substr(start, match_length);
      var actual = input.substr(start, match_length);

      if (add_http) {
        actual = 'http://'+actual;
      }
      var replacement = '<a target="_blank" href="';
      
      if (!is_url) {
        replacement += 'mailto:';
      }

      replacement += actual.replace(/"/g, '%22')+'"';
      replacement += ' title="';
      
      if (is_url) replacement += actual;
      else replacement += 'Email '+actual;
      
      replacement += '"';
      
      if (truncate_length && address.length > truncate_length) {
            address = address.substr(0, truncate_length) + '...';
        }
      
      // Add word break tags to allow wrapping where appropriate
      replacement += '>'+address.replace(new RegExp("([/=])", 'g'), "<wbr>$1")+'</a>';
      if (matched_links) {
        matched_links.push(actual);
      }
      
      input = input.slice(0, start) + replacement + input.slice(start+match_length, input.length);
      re.lastIndex = start + replacement.length;
      offset = start + replacement.length;
    }
    
    return input;
  },
  
  /**
   * Replace text emoticons with images
   **/
  emoticon_text: function(text) {
    for (var idx in this.emoticons) {
      var e_data = this.emoticons[idx];
      var regex = e_data.regex;
      var img = e_data.image;
      
      // (not a word character)(smiley regex)(not a word character)
      var pattern = new RegExp('(^|\\W)'+regex+'(?=\\W|$)', 'gim');
      text = text.replace(pattern, '$1<img name="emoticon" alt="'+e_data.shortcut+'" height="'+e_data.height+'" width="'+e_data.width+'" src="/path/to/emoticon/'+img+'" />');
    }
    return text;
  }
};
