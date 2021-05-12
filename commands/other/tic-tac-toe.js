const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Pagination = require('discord-paginationembed');
const Canvas = require('canvas');

module.exports = class TicTacToeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tic-tac-toe',
      memberName: 'tic-tac-toe',
      group: 'other',
      description: `Play a game of Tic Tac Toe against another player.`,
      details: ` **The Rules**
              Players must get 3 of the same colored squares in a row to win.
              Only one piece is played at a time.
              Players can be on the offensive or defensive.
              The game ends when there is a 3-in-a-row or a stalemate.
              The starter of the previous game goes second on the next game.
              Use the emojis 1️⃣, 2️⃣, 3️⃣ for columns and 🇦, 🇧, 🇨 for rows
              You must click both a number and a letter to place your colored square in that space.
              You have 1 minute per turn or it's an automatic forfeit.
              Incase of invisible board click 🔄 (may take more than one click).`,
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'player2',
          prompt: 'Who is your Opponent?',
          type: 'user'
        }
      ]
    });
  }
  async run(message, { player2 }) {
    const player1 = message.author;

    if (player1.id === player2.id) {
      return message.channel.send("Sorry can't play against yourself");
    }
    if (player2.bot) {
      return message.channel.send("Sorry can't play against a bot user");
    }

    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });
    const player2Avatar = player2.avatarURL({
      format: 'jpg'
    });
    let gameBoard = [
      [0, 0, 0], //row 1
      [0, 0, 0],
      [0, 0, 0]
      // column ->
    ];
    let row = null;
    let column = null;
    let currentPlayer = player1.id;
    let boardImageURL = null;

    let currentTurn = 0;
    await createBoard(message);
    ++currentTurn;

    new Pagination.Embeds()
      .setArray([new MessageEmbed()])
      .setAuthorizedUsers([player1.id, player2.id])
      .setThumbnail(player1Avatar)
      .setChannel(message.channel)
      .setColor('RED')
      .setTitle(`Tic Tac Toe - Player 1's Turn`)
      .setDescription(
        `Use the emojis 1️⃣, 2️⃣, 3️⃣ for columns and 🇦, 🇧, 🇨 for rows.\n
         You must click both a **Number** and a **Letter** to place your colored square in that space.\n
         You have 1 minute per turn or it's an automatic forfeit.\n
         Incase of invisible board click 🔄.`
      )
      .setImage(boardImageURL)
      .setFooter('Incase of invisible board click 🔄')
      .setTimestamp()
      .setTimeout(60000)
      .setDisabledNavigationEmojis(['all'])
      //.setDeleteOnTimeout(true)
      .setFunctionEmojis({
        // Column 1
        '1️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            column = 0;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Column 2
        '2️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            column = 1;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Column 3
        '3️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            column = 2;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Row A
        '🇦': async function(user, instance) {
          if (currentPlayer === user.id) {
            row = 0;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Row B
        '🇧': async function(user, instance) {
          if (currentPlayer === user.id) {
            row = 1;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Row C
        '🇨': async function(user, instance) {
          if (currentPlayer === user.id) {
            row = 2;
            if (row !== null && column !== null) {
              await playerMove(row, column, user, instance);
              return (row = null), (column = null);
            }
          }
        },
        // Refresh Image
        '🔄': function(_, instance) {
          instance.setImage(boardImageURL);
        }
      })
      .build();

    function createBoard(message) {
      // Set asset sizes
      const boardHeight = 700;
      const boardWidth = 700;
      const pieceSize = 150;

      // Set Image size
      const canvas = Canvas.createCanvas(boardWidth, boardHeight);
      const ctx = canvas.getContext('2d');

      // Get Center to Center measurements for grid spacing
      const positionX = 600 / 3;
      const positionY = 600 / 3;

      // Tic-Tac-Toe Board
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, boardWidth, boardHeight);

      ctx.font = '100px Open Sans Light';
      ctx.fillStyle = 'grey';
      // Add Shadows to indicators and empty spaces
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 2;
      // Column Numbers
      ctx.fillText('1', 40, 650);
      ctx.fillText('2', 250, 650);
      ctx.fillText('3', 450, 650);
      // Row Letters
      ctx.fillText('A', 575, 110);
      ctx.fillText('B', 575, 310);
      ctx.fillText('C', 575, 510);

      // Build the Game Board
      for (let columnIndex = 0; columnIndex < 3; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
          ctx.beginPath();

          // Empty Spaces
          if (gameBoard[rowIndex][columnIndex] === 0) {
            ctx.fillStyle = 'grey';
            ctx.fillRect(
              positionX * columnIndex,
              positionY * rowIndex,
              pieceSize,
              pieceSize
            );
          }

          // Player 1 Pieces
          if (gameBoard[rowIndex][columnIndex] === 1) {
            ctx.fillStyle = 'red';
            ctx.shadowColor = 'grey';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(
              positionX * columnIndex,
              positionY * rowIndex,
              pieceSize,
              pieceSize
            );
          }
          // Player 2 Pieces
          if (gameBoard[rowIndex][columnIndex] === 2) {
            ctx.fillStyle = 'blue';
            ctx.shadowColor = 'grey';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(
              positionX * columnIndex,
              positionY * rowIndex,
              pieceSize,
              pieceSize
            );
          }
        }
      }

      const attachment = new MessageAttachment(
        canvas.toBuffer(),
        `TicTacToe-${player1.id}-${player2.id}${currentTurn}.png` // to prevent cross-talk when multiple games are running at the same time in the same channel
      );

      return message.channel
        .send(attachment)
        .then(result => {
          boardImageURL = result.attachments.entries().next().value[1].url;
          result.delete();
        })
        .catch(err => {
          if (err) {
            console.log(err);
          }
        });
    }

    async function playerMove(row, column, user, instance) {
      if (gameBoard[row][column] !== 0 || currentPlayer === 'Game Over') {
        return; // Ignore occupied spaces or if the game is over
      }
      if (currentPlayer === user.id) {
        if (currentPlayer === player1.id) {
          gameBoard[row][column] = 1;
          currentPlayer = player2.id;
          instance
            .setThumbnail(player2Avatar)
            .setTitle(`Tic Tac Toe - Player 2's Turn`)
            .setColor('BLUE');
        } else {
          gameBoard[row][column] = 2;
          currentPlayer = player1.id;
          instance
            .setThumbnail(player1Avatar)
            .setTitle(`Tic Tac Toe - Player 1's Turn`)
            .setColor('RED');
        }
        await createBoard(message);
        ++currentTurn;
      }

      if (checkWinner(gameBoard) === 0) {
        return instance.setImage(boardImageURL).setTimestamp();
      } else {
        instance
          .setImage(boardImageURL)
          .setTitle(
            `Tic Tac Toe - 👑 Player ${checkWinner(gameBoard)} Wins! 👑`
          )
          .setTimestamp();
        if (currentPlayer === player1.id) {
          instance.setThumbnail(player2Avatar).setColor('BLUE');
        } else {
          instance.setThumbnail(player1Avatar).setColor('RED');
        }
        currentPlayer = 'Game Over';
        return;
      }
    }

    // Check for Win Conditions
    function checkLine(a, b, c) {
      // Check first cell non-zero and all cells match
      return a != 0 && a == b && a == c;
    }

    function checkWinner(board) {
      // Check down
      for (let c = 0; c < 3; c++)
        if (checkLine(board[0][c], board[1][c], board[2][c]))
          return board[0][c];

      // Check right
      for (let r = 0; r < 3; r++)
        if (checkLine(board[r][0], board[r][1], board[r][2]))
          return board[r][0];

      // Check down-right
      if (checkLine(board[0][0], board[1][1], board[2][2])) return board[0][0];

      // Check down-left
      if (checkLine(board[0][2], board[1][1], board[2][0])) return board[0][2];

      return 0;
    }
  }
};
