![](/img/_server_/yate_banner.jpg?raw=true)

# yate
"Yet Another Tabletop Experience" is a simple Node.js/Socket.io-based engine to play games with friends in your browser. 
This project was initiated due to restrictions regarding personal contacts in early 2020 and the consequential limited options to play games with friends.
Originally, yate was intended as an engine solely for playing Pen&Paper games.
However, yate has since grown to support many more game elements (like cards or lotteries) needed up to the point where most games can be played out-of-the-box.
Its advantage compared to other board game simulations is the compatibility since only a modern browser is required to play.
Have a look at the [YouTube channel](https://www.youtube.com/channel/UC_QIouG5f1K7kbNoxriW3LA) for a trailer and examples for the game management.


## Contents

* [Setup](#setup)
* [List of Features](#list-of-features)
* [Planned Additions](#planned-additions)
* [Issues](#issues)
* [License](#license)

## Setup

1. Install `Node.js` with `npm` from [here](https://nodejs.org/en/download/).

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
   in the command prompt/console. If no errors occured, the command prompt/console message shows the public IP-adress and the local port on which the server is listening in the format XXX.XXX.XXX.XXX:8080 . Paste this adress (or simply localhost:8080 if you are on the same machine) into your browser adress bar and connect to the server.
5. In order to give other people access to your server, you have to configure your router to forward the port accordingly. Other players can then join your game using the IP-adress from above. If you want to use a different local port, simply edit the file `index.js`.
6. Prepare a list of players by simply editing the existing file `players.dat` with a text editor. The first line of that file is referring to the game master. Note, that this game master will be the only "player" having full control over game elements. You can then add the names of players for your game line by line. If you prefer to have other players to verify themselves, you can add a required passphrase separated by a tabulator behind the player name.

See the [List of Features](#list-of-features) for more information on how to prepare a simple game.

## List of Features
## Planned Additions
Since yate is written in JavaScript you can easily implement modifications you may need for some specific kind of game.
You are free to suggest features or even the code that implements those features to be added to this repository.
Please refer to me via [mail](mailto:mail.yateofficial@gmail.com).

Next on the list of features/changes to be implemented:
* **Copy**: Include copy functionality for more game elements than only player/npc tokens.
* **Silent Lottery**: Add setting for lottery to not print results to log. 
* **Chat**: Minimal text chat window. 
* **Help**: Include in-game information regarding controls.
* **Cleanup**: Due to the grown nature of yate, it is a (for now persistent) goal to clean up the code base and unify functionalities.

## Issues
Due to the afore mentioned history regarding yate's development the code itself is rather messy.
As stated in the [Planned Additions](#planned-additions) section, the cleanup will require more time especially as it is (at the moment) low priority.

## License