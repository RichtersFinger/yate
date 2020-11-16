![](/img/_server_/yate_banner.jpg?raw=true)

# yate - „Yet Another Tabletop Experience"
„Yet Another Tabletop Experience" is a simple Node.js/Socket.io-based engine to play games with friends in your browser. 
This project was initiated due to restrictions regarding personal contacts in early 2020 and the consequential limited options to play games with friends.
Originally, yate was intended as an engine solely for playing Pen&Paper games.
However, yate has since grown to support many more game elements (like cards or lotteries) needed up to the point where most games can be played out-of-the-box.
Its advantage compared to other board game simulations is the compatibility since only a modern browser is required to play.
Simply use a search engine to find an image of your favourite board game and/or other materials needed and start playing (see for example the [yate vanilla card deck](https://drive.google.com/drive/folders/1ldPSZmPTsI8vQOFMBe-Gam9nXgMdhJY7)).
Also have a look at the [YouTube channel](https://www.youtube.com/channel/UC_QIouG5f1K7kbNoxriW3LA) for a soon to be published trailer and examples for the game management.

## Contents

* [Setup](#setup)
* [List of Features](#list-of-features)
   * [Controls](#controls)
   * [Game Elements](#game-elements)
   * [Game Settings & Actions](#game-settings--actions)
* [Planned Additions](#planned-additions)
* [Known Issues](#known-issues)
* [License](#license)

## Setup

1. Install `Node.js` with `npm` from [here](https://nodejs.org/).

   (Optional: I recommend to add the binary directory of Node.js to your path variable.)
2. Download the contents of this repository and move them into a clean directory.
3. Open a command prompt/console in the newly created yate directory. Execute `npm` to install the components `express`, `socket.io`, and `external-ip` using
   ```console
   $ npm install express socket.io external-ip
   ```
4. Test the server by issuing 
   ```console
   $ node index.js
   ```
   in the command prompt/console. If no errors occured, the command prompt/console message shows your public IP-address and the local port on which the server is listening in the format XXX.XXX.XXX.XXX:8080 . Paste this address (or simply localhost:8080 if you are on the same machine) into your browser address bar and connect to the server.
5. In order to give other people access to your server, you have to configure your router to forward the port accordingly. Other players can then join your game using the IP-address from above. If you want to use a different local port, simply edit the file `index.js`.
6. Prepare a list of players by simply editing the existing file `players.dat` with a text editor. The first line of that file is referring to the game master. Note, that this game master will be the only „player" having full control over game elements. You can then add the names of players for your game line by line. If you prefer to have other players to verify themselves, you can add a required passphrase separated by a tabulator behind the player name.

See the [List of Features](#list-of-features) for more information on how to prepare a simple game.

## List of Features

### Controls
* **Move Camera**: Hold `Middle Mouse Button` and drag your mouse to move your view.
* **Zoom In/Out**: By turning the `Mouse Wheel` you can zoom in and out of the game.
* **Interact**: You can drag&drop most game elements (if you are permitted to by the game master) or double click with your `Left Mouse Button` to interact (e.g. double clicking on a `Die` will initiate a dice roll, whereas a double click on a `Card` will cause this card to turn over). 
* **Modify**: By clicking with your `Right Mouse Button` you can open a [context menu](https://swisnl.github.io/jQuery-contextMenu/) of available actions. 
   
   Game Master Controls: Aside from general settings and actions you will find a section referring to the game element clicked on. This section is initiated with a label containing the type of the game element and its internal id. There the game master can `push`, `delete` or modify settings of this game element. See below for a detailed description of all functionalities. Most elements can also be manipulated in size or regarding the element layering by holding `Shift` or `Alt`, respectively, while turning the `Mouse Wheel`.

### Game Elements
Aside from the `Die` elements that are only visible for their creator, only the game master can create game elements. After creation those elements are initially only a local object until either the `Push This` or the `Push All` actions from the context menu are performed. Only then the server receives the information. In general, changes that are made in the configuration of game elements will be local until pushed to the server. In some cases there will also be shown a `Restore` option to reload the current server-side settings for the given element. Selecting `Push Delete` will immediately delete the selected element from the server. All updates the server receives are passed on to all clients.


* **Image Element**
   The `Image` element is simply a static image. Depending on your type of game you may use this for the game board, a table texture, or a map/illustration for your Pen&Paper game. By selecting `Load Image` in the context menu a small window will open prompting you to select an image from a list of files in the `img/` directory. If you added new images to this directory after the server was started, click `Update List` in order to find that image via the autocomplete functionality. Alternatively, you may upload your image file via drag&drop of the file onto the selection dialog. The file will then be uploaded upon the next push on this game element.
   
   The configurable settings for this element are:
   * **Owner** - controls who has permission to drag this element
   * **Position Streaming** - toggle whether changes in the position of this element are streamed to the server
   * **Visibility** - toggle visibility for non-game master on and off
   * **Lock** - toggle whether this element can be moved
   * **Background** - toggle between white and a transparent background for this element
* **Image Label Element**
   The `Label` element can only be added to an existing `Image` element. 
   
   The configurable settings for this element are:
   * **Position and Size** - note that you can also modify the position and size of this element by holding down `Shift` + dragging with `Left Mouse Button` or turning the `Mouse Wheel`, respectively
   * **Set Text** - specify the text that will be displayed; alternatively using a double click on the `Label` as a shortcut
   * **Set Arc** - this setting controls whether the `Label` is displayed in an arc using [CircleType.js](https://circletype.labwire.ca/)
   * **Set Angle** - this option rotates the `Label` by the specified angle
   * **Set Color** - select the color of the `Label` using [jscolor](https://jscolor.com/)
* **Image Marker Element**
   The `Marker` element can only be added to an existing `Image` element. By selecting `Load Image` in the context menu a small window will open prompting you to select an image from a list of files in the `img/` directory. If you added new images to this directory after the server was started, click `Update List` in order to find that image via the autocomplete functionality. Alternatively, you may upload your image via drag&drop of the file onto the selection dialog. The file will then be uploaded upon the next push on this or its parent game element.

   The configurable settings for this element are:
   * **Position and Size** - note that you can also modify the position and size of this element by holding down `Shift` + dragging with `Left Mouse Button` or turning the `Mouse Wheel`, respectively
   * **Description** - toggle whether a description window will be opened upon clicking with `Left Mouse Button`
* **Token Element**
   The `Token` element is intended as player representation, e.g. in a regular board game or a Pen&Paper game. By selecting `Load Image` in the context menu a small window will open prompting you to select an image from a list of files in the `img/` directory. If you added new images to this directory after the server was started, click `Update List` in order to find that image via the autocomplete functionality. Alternatively, you may upload your image via drag&drop of the file onto the selection dialog. The file will then be uploaded upon the next push on this game element. 
   
   Any `Token` a player has control over is raised to the top layer making those `Tokens` always accessible.
   
   The configurable settings for this element are:
   * **Image Section** - after loading an image you can adjust the image section shown on the token by holding down `Shift` + dragging with `Left Mouse Button` and turning the `Mouse Wheel`, respectively
   * **Owner** - controls who has permission to drag this element
   * **Position Streaming** - toggle whether changes in the position of this element are streamed to the server
   * **Visibility** - toggle visibility for non-game master on and off
   * **Description** - toggle whether a description window will be opened upon clicking with `Left Mouse Button`
   * **Set Token Size** - specify the size of the selected `Token`
   * **Reset Token Image** - this restores the default setting for the image section selection
   * **Set Color** - this option allows you to change the color of the `Token` border using [jscolor](https://jscolor.com/)
   * **Color From List** - this option allows you to quickly change the color of the `Token` border by selecting from a preset list of colors
   
* **Token/Marker Description**
    The description name and text of a `Token` or a `Marker` can be edited by first expanding the description. From there the description can either be edited by clicking `Edit` or loaded by clicking `Load`. The latter requires a file to be prepared in the `data/` directory in the format described in the demo-file `desctest.dat`.
    
* **Canvas Element**
   The `Canvas` element based on [Fabric.js](http://fabricjs.com/) can be used in very different scenarios like an easy way to make records, quickly sketch surroundings in a Pen&Paper game, or drawing charades. 
   
   After creation double click with the `Left Mouse Button` to enter the drawing/editing mode. The menu on the right side of the screen provides the basic settings like brush size and color or enables the addition of Fabric.js-objects like `Images` or `Text` to the `Canvas`. Using the button on the bottom right or by pressing `Tab` you can toggle between `Draw`- and `Edit`-mode. While in `Edit` mode you can select and manipulate objects previously added to the `Canvas`. This also includes a context menu for those `Canvas` objects.
   
   The configurable settings for this element are:
   * **Owner** - controls who has permission to draw on this element
   * **Position Streaming** - toggle whether changes in the position of this element are streamed to the server
   * **Content Streaming** - toggle whether content changes of this `Canvas` are streamed to the server
   * **Lock** - toggle whether this element can be moved
   * **Set Canvas Size** - specify the size of the selected `Canvas`
   
* **Card Element**
   Currently, `Card` elements can only be added by the use of the `New Deck` option in the context menu. 
   
   Upon selecting this option you are prompted with a file selection window from your browser to select a text file containing the information what `Cards` are in that deck. A demo file is located in `data/testdeck.dat` explaining the format. Every line after the first has to contain four tab-separated values representing one card. The first two values are the current `Card`'s width and height. The third and fourth values are the relative paths to the image files on the server. If you do not need an image for the back of a card, you may enter only a `-` to indicate an empty card back.

   `Card` elements have several additional controls/actions that can be performed (some are only available for the game master):
	* **Multi-Card Selection**: You can select multiple `Cards` at once by holding `Ctrl` while clicking with the `Left Mouse Button`. All `Cards` below your cursor at the time of the click will be added to the selection. Deselect by clicking again on another game element or the background. Actions like dragging, turning, rotating etc. are then performed on the selected stack of `Cards`.
	* **Turning Cards**: You can turn a `Card` element (or the current selection) by double clicking with the `Left Mouse Button`.
	* **Rotating Cards**: You can rotate a `Card` element (or the current selection) by turning the `Mouse Wheel` while those `Cards` are being dragged.
	* **Drawing/Discarding Cards**: By opening a context menu on a `Card` or selection of `Cards` and if the permission was given to you, you can draw `Cards` to your hand (an icon will be shown in the top left corner of the card). The `Card` will not be publicly turned but only be visible for you (or others who have drawn this `Card`/these `Cards` at the same time). The same procedure performed on a `Card` that is already on your hand will present you the option to discard that `Card` again.
	* **Turn Face Up/Down** - force all selected `Cards` to be turned face up/down
	* **Collect** - collect all selected `Cards` and position them in the same location as the `Card` for which the context menu was opened
	* **Arrange** - collect all selected `Cards` and arrange them with a small relative displacement
	* **Shuffle** - shuffle the selected stack of `Cards`
	* **Prepare** - perform a forced discard, face down, collection, and shuffle action on the selected deck
	* **Grab Top N** - reduce the current selection of `Cards` to the top N `Cards`; N is always the last input from **Grab Top ..**
	* **Grab Top ..** - you are prompted to enter a number; reduce the current selection of `Cards` to the entered number of `Cards`
	
   Some of the configurable settings for this element can be changed for the selected `Card`, the selected stack of `Cards`, and the entire deck of `Cards`; those options are presented in the corresponding submenus:
   * **Moving Rights** - controls who has permission to drag this element/these elements
   * **Viewing Rights** - controls who has the permission to view face down `Cards` or draw `Cards` to their hand
   * **Change Scale** - change the scale the selected `Cards` are displayed in
   * **Set Deck ID** - the layering of `Cards` from different decks of `Cards` is organized in such a way that all `Cards` from a deck with larger ID are always on top of `Cards` from decks with smaller IDs; use this setting to control what deck of `Cards` is on top of which deck
   * **Delete** - remove the selected deck from the game
* **Lottery Element**
   The `Lottery` element can have very different uses depending on the kind of game. It may serve as an indicator for who's turn it currently is, as a literal lottery enabling to pick randomly from a list of words, or even an emote by using the TTS support. Selecting `Set Options` in a `Lottery`'s context menu prompts the game master to enter a list of values separated by line breaks, commas are automatically exchanged by line breaks. The game master is also able to initialize the `Lottery` by specifying a current option inside the `Set Option` submenu. The next entry of the `Lottery` is picked by double clicking with the `Left Mouse Button` or via the `Lottery`'s context menu's option `Pick Next`.
   
   The configurable settings for this element are:
   * **Owner** - controls who has permission to drag this element or pick next result
   * **Visibility** - controls element visibility for players and who will get `Lottery` results printed to the log
   * **Position Streaming** - toggle whether changes in the position of this element are streamed to the server
   * **Select Random** - toggle whether next pick will be random from the list of `Lottery` options
   * **Turn Indicator** - toggle whether this `Lottery` is treated as turn indicator printing changes to the log accordingly
   * **Write Log** - toggles whether `Lottery` results are printed to the log
   * **Use TTS** - toggles whether `Lottery` results are queued as TTS (text-to-speech) tofor all players (except the game master); this ignores the visibility setting
   * **Lock** - toggle whether this element can be moved
   
* **Die Element**
   The `Die` element is the only kind of game element that all players can create. Also, this element is only visible for the local player and is not being saved when the connection is closed. This element will not be affected by repositioning of the camera or changes of the zoom. It can be rescaled by holding `Shift` while turning the `Mouse Wheel`. You can roll a `Die` by double clicking with the `Left Mouse Button` or by opening its context menu and selecting `Roll`. 
   
   The configurable settings for this element are:
   * **Set Die Color** - select the `Die`'s color from a list of colors
   * **Link to Token** - if a `Token` is in the game you have control over, you can also link this `Die` and said `Token`; linked `Dice` can be rolled from the `Token`'s context menu and the log message will state the `Token`'s name
   
* **Public Die Element**
   The `Public Die` element has mostly the same features as the `Die`. Differences are that the `Public Die` is visible for all players and its properties like color and size can only be controlled by the game master.
   
   The configurable settings for the element are:
   * **Owner** - controls who has permission to drag or roll this the `Die`
   * **Lock** - toggle whether this element can be moved
   * **Set Die Color** - select the `Die`'s color from a list of colors
   * **Set-Able** - toggle whether the `Die`'s value can be set by turning the `Mouse Wheel` while hovering over the element
   * **Animation** - toggle whether rolling animation is shown after a roll is initiated
   
### Game Settings & Actions

* **Game Options**
   In this submenu it is possible to add arbitrary (previously implemented) modifyers to the game. An example is the option to have `Cards` in a certain deck be dragged to the top layer of the deck on the initiation of a `Card`-drag (this is recommended for most basic card games). Suppose you want to play a game of cards where the `Card` that has been moved last should be raised to the top of the entire deck. For a deck ID of 2 a game option `d2dragtotop` has to be added to the game. For the implementation of a custom rule `<keyword>` you can simply use the condition 
   ```
   if (gameoptions.includes('<keyword>')) {..}
   ```
   to test whether that rule is active. The `<keyword>` has only the requirement of containing no spaces. All changes to the list of game options are immediately forwarded to all clients.

   * **Add Option**
      As described above this is an easy way to implement additional custom rules for yate that are kept track of by the server. You can add multiple options at once separated by a space. 
      
      Currently the following game options are implemented:
      * `d<deckid>dragtotop` - drag `Cards` of the deck with corresponding ID to the top on initiation of a drag
      * `d<deckid>randomizeangles` - have the orientation of a `Card` from the deck with corresponding ID be randomized by a few degrees on termination of a drag
      * `notes` - allow players to open a window where notes can be made; this can be useful for Pen&Paper games where character attributes or inventory may be noted; alternatively, the game master can use this to make player-specific notes
      
   * **Remove Options**
      The prompt is automatically filled with all currently set game options. You can remove multiple options at once separated by a space.
      
   * **Show Log**
      Use this to toggle whether player (aside from game master) can see a log in the bottom right corner of their screen.
      
   * **Set This Camera**
      Set the initial view (camera position and zoom) for newly joining clients to the current view.
      
   * **Unset Camera**
      Revert view settings for newly joining clients back to default.

   * **Set Global Token Size**
      Use this option to change the size of all `Tokens` at once.
      
   * **Set Global Marker Size**
      Use this option to change the size of all `Markers` at once.
* **Rearrange Layering**
   The `Rearrange Layering` action goes over all present game elements and adjusts the layering of those elements to a predefined hierarchy. The order from lowest to highest layer is: `Image/Canvas` → `Card` → `Lottery` → `Token` → `Public Die`. A manual change of layering is possible by holding `Alt` and turning the `Mouse Wheel`. The changes in layering have to be pushed to become visible for players. Note that a `Token` that a player has control over will always stay on top regardless of other layering.
   
* **Push All**
   Loop over all game elements and perform a push to the server.
   
* **Force Discard All**
   Force all clients to discard all `Cards` that are currently visible due to being drawn onto their hand.

* **Save/Load**
   `Save` current state of the game to or `Load` a previous state of a game from an XML-file. On issuing a `Save` the server writes a savestate to the directory `savestates/` and allows the game master to also save this file on their machine. 'Load' requires the game master to select a suitable savestate from their local machine. Note that loading a savestate into a game where game elements exist already causes the elements from the savestate to be added to game additionally (they will not be replaced or deleted).
* **Restore All**
   Use this option to restore all game elements from the server where possible.
* **Delete All**
   Confirming this action cleans up the entire game.
   
   
## Planned Additions
Since yate is written in JavaScript you can easily implement modifications you may need for some specific kind of game.
Have a look at the notes in the section regarding [**Game Options**](#game-settings--actions) for a comment on how to do this most easily.
Feel free to ask for help on implementation of modifications, suggest features, or even provide the code that implements those features to be added to this repository.
Please refer to me via [mail](mailto:mail.yateofficial@gmail.com).

Next on the list of features/changes to be implemented:
* **Marker**: Redo `Marker` icons to stand out more.
* **Copy**: Include copy functionality for more game elements (only `Tokens`).
* **Chat**: Minimal text chat window. 
* **Help**: Include in-game information regarding controls.
* **Cleanup**: Due to the grown nature of yate, it is a (for now persistent) goal to clean up the code base and unify functionalities.

## Known Issues
For unstable internet connection some unexpected behavior regarding the synchronicity between server and client has been observed.

Due to the afore mentioned history regarding yate's development the code itself is rather messy.
As stated in the [Planned Additions](#planned-additions) section, the cleanup will require more time especially as it is (at the moment) low priority.

## License

Copyright (c) 2020 Steffen Richters-Finger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.