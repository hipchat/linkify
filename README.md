Linkify
=======

To make use of the library, get the source code from the git repository here: http://github.com/hipchat/linkify/archives/master or check out the repository using:

    %> git clone git@github.com:hipchat/linkify.git

Take the code approrpriate to the language you're coding in as described below.


ActionScript
------------

You may either:

1. Copy the swc into a local folder (e.g. the /libs directory in a Flex project) and change the project properties to include linkify.swc in the build process
2. Include the source code directly.  If you include the source directly, you must make sure to include the folder structure as well (e.g. you may have a folder <project_name>/libs/com/hipchat/Linkify.as)

Once you have added the code/swc to your project, import the library and access it through the Linkify class:

    <mx:Script>
      <![CDATA[
        import com.hipchat.Linkify;
      
        ...
        var linkified_text:String = Linkify.linkify(unlinkified_text, ...);
        ...
      ]]>
    </mx:Script>

Please note, if you wish to include the emoticonify functionality, you will need to edit the source code to link emoticons to the correct place.  See the emoticonText function in Linkify.as.


JavaScript
----------

Copy the linkify.js file to your own repository/web server.  Include linkify.js on your page.  The linkification function can be accessed throught he global linkify object:

    <script>
      var linkified_text = linkify.linkify(unlinkified_text, ...);
    </script>