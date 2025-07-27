const { html } = require('hono/html');

const layout = (props) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        html {
          color-scheme: dark;
        }

        body {
          font-size: 16px;
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`;

module.exports = layout;
