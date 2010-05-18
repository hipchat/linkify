package com.hipchat {

	public class Linkify {
		public static const RE_EMAIL_PATTERN:String = '(?<=\\s|\\A)[\\w.-]+\\+*[\\w.-]+@(?:(?:[\\w-]+\\.)+[A-Za-z]{2,6}|(?:\\d{1,3}\\.){3}\\d{1,3})';
		public static const RE_TLD:String = '(?:aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)'; // Top level domains
		public static const RE_URL_MIDCHAR:String = '[\\w\\.,@*"?^=%&;:/~\+#\'|-]'; // characters allowed in URL center
		public static const RE_URL_ENDCHAR:String = '[\\w@?^=%&/~\+#-]';     // URL must end with one of these chars
		public static const RE_URL_ENDING:String = '(?:'+RE_URL_MIDCHAR+'*(?:\\('+RE_URL_MIDCHAR+'*\\)'+RE_URL_ENDCHAR+'*|'+RE_URL_ENDCHAR+'))?';
		public static const RE_URL_SCHEME:String = '(?:http|ftp|https|news|mms)://';

		// If we have the scheme/protocol, always linkify (don't require a valid TLD)
		public static const RE_FULL_URL:String = RE_URL_SCHEME+'\\w+(?:.\\w+)'+RE_URL_ENDING;
		// URLs not starting with a protocol (e.g. www.google.com instead of http://www.google.com)
		public static const RE_OTHER_URL:String = '\\w[\\w_-]*(?:\\.\\w[\\w_-]*)*\\.'+RE_TLD+'(?:\\/'+RE_URL_ENDING+')?\\b';
		
		// Text to turn in to emoticon images
		// emoticons.regex is a pattern to be used in the RegExp constructor
		// emoticons.shortcut is the text actually typed to get the emoticon
		// Width and height provided to avoid jittering as images load
		private static const emoticons:Array = [
			{regex: ':-?D',        		  shortcut: ':D',        		   width: 18,	height: 18,		image: 'bigsmile.png'},
			{regex: ':-?o',          	  shortcut: ':o',         		   width: 18,	height: 18,		image: 'gasp.png'},
			{regex: ':-?p',         	  shortcut: ':p',         		   width: 18,	height: 18,		image: 'tongue.png'},
			{regex: '8-?\\)',        	  shortcut: '8)',        		   width: 18,	height: 18,		image: 'cool.png'}, 
			{regex: ':-?\\(',        	  shortcut: ':(',        		   width: 18,	height: 18,		image: 'frown.png'},
			{regex: ':-\\*',      		  shortcut: ':-*',      		   width: 18,	height: 18,		image: 'kiss.png'},
			{regex: ':\\\\',      		  shortcut: ':\\',      		   width: 18,	height: 18,		image: 'slant.png'},
			{regex: ':-?\\)',        	  shortcut: ':)',        		   width: 18,	height: 18,		image: 'smile.png'},
			{regex: ':-?\\|',             shortcut: ':|', 	               width: 18,	height: 18,		image: 'straightface.png'},
			{regex: ';-?\\)',        	  shortcut: ';)',        		   width: 18,	height: 18,		image: 'wink.png'}];

		/**
		 * Linkify a string, replacing text urls with <a href="url">url</a>
		 *
		 * @param text - String to be linkified
		 * @param emoticonify - Whether to replace text emoticons with images
		 * @param dispatchEvent - Whether to dispatch a link: event (to be handled in actionscript)
		 *  see: http://blog.flexexamples.com/2008/01/26/listening-for-the-link-event-in-a-flex-label-control/
		 *  see: http://livedocs.adobe.com/flex/3/html/help.html?content=textcontrols_04.html
		 * @param matchedLinks - Return param (pass by ref) - Array of links matched during linkification
		 **/
		public static function linkify(text:String, 
										emoticonify:Boolean = true, 
										dispatchEvent:Boolean = false, 
										truncateLength:uint = 0,
										matchedLinks:Array = null):String {
			text = Linkify.matchAndReplace(RE_EMAIL_PATTERN, text, false, false, dispatchEvent, truncateLength, matchedLinks);
			text = Linkify.matchAndReplace(RE_FULL_URL, text, true, false, dispatchEvent, truncateLength, matchedLinks);
			text = Linkify.matchAndReplace(RE_OTHER_URL, text, true, true, dispatchEvent, truncateLength, matchedLinks);
			
			if (emoticonify)
				text = Linkify.emoticonText(text);
				
			return text;
		}
		
		/**
		 * Internal helper function for linkification
	  	 **/
		private static function matchAndReplace(pattern:String, 
												input:String, 
												isURL:Boolean = false, 
												addHTTP:Boolean = true, 
												dispatchEvent:Boolean = false,
												truncateLength:uint = 0,
												matchedLinks:Array = null):String {
			var start:int = 0;
			var offset:int = 0;
			var matchLength:int = 0;
			var endTagPos:int = 0;
			var closeAnchorRe:RegExp = /<\/[aA]>/;
			var re:RegExp = new RegExp(pattern, "g");
			
			var match:Object = new Object();
			
			// Limit the number of links we match in one pass
			var maxIter:int = 20;
			var curIter:int = 0;
			while (match = re.exec(input)) {
				curIter++;
				if (curIter > maxIter)
					break;
				
				start = match.index; // start of match
				matchLength = match[0].length;
	
				// If we find an opening anchor tag, advance to its end and continue looking
				var substr:String = input.substring(offset, start);
				if (substr.search(/<[aA]/) >= 0) {
					// Find the closing anchor tag
					closeAnchorRe.lastIndex = offset;
					var closeAnchorPos:int = input.substring(offset, input.length).search(closeAnchorRe);
					
					// If we find an opening tag without a closing match, just return the current input
					if (closeAnchorPos < 0)
						return input;

					endTagPos = closeAnchorPos + offset;

					// RegExp.lastIndex is used to tell the regexp where to start matching
					re.lastIndex = endTagPos + 4;
					offset = endTagPos + 4;

					continue;
				}

				// Do the replacement of url text with anchor tag
				var address:String = input.substr(start, matchLength);
				var actual:String = input.substr(start, matchLength);
	
				if (addHTTP) {
					actual = 'http://'+actual;
				}
				var replacement:String = '<a href="';
				
				if (dispatchEvent) {
					replacement += 'event:';
				} else if (!isURL) {
					replacement += 'mailto:';
				}
	
				replacement += actual.replace(new RegExp('"', 'g'), '%22')+'"';
				
				if (truncateLength && address.length > truncateLength) {
        			address = address.substr(0, truncateLength) + '...';
    			}
				
				// Add word break tags to allow wrapping where appropriate
				// Manually put font styles around the link so they actually look like links
				// see: http://livedocs.adobe.com/flex/3/html/help.html?content=textcontrols_04.html
				replacement += '><font color="#0000ff"><u>'+address.replace(new RegExp("([/=&])", 'g'), "<wbr>$1")+'</u></font></a>';
				if (matchedLinks) {
					matchedLinks.push(actual);
				}
				
				input = input.slice(0, start) + replacement + input.slice(start+matchLength, input.length);
				re.lastIndex = start + replacement.length;
				offset = start + replacement.length;
			}
			
			return input;
		}
		
		/**
		 * Replace text emoticons with images
		 **/
		private static function emoticonText(text:String):String {
			for each (var eData:Object in Link.emoticons) {
				var regex:String = eData.regex;
				var img:String = eData.image;
				
				// (not a word character)(smiley regex)(not a word character)
				var pattern:RegExp = new RegExp('(?<!\\w)'+regex+'(?!\\w)', 'gim');
				text = text.replace(pattern, '<img name="emoticon" alt="'+eData.shortcut+'" height="'+eData.height+'" width="'+eData.width+'" src="http://emoticon-hosting-site/'+img+'" />');
			}
			return text;
		}
	}
}
