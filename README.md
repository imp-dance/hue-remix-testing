# Hue-remix light controller app

A simple light controller app made with remix.

## Pairing with your device

To pair with your device, first clone the project and create a `.env` file in the root of the project. Fill it with the following:

```bash
USERNAME=x
CLIENTKEY=x
CONNECTION=x
```

Install the dependencies and launch the dev server. Navigate to the `/connect` route. You will be prompted for an IP address. To find this, open up your hue app,
then go to settings > bridge settings. In the bridge settings you should be able to see the IP address. Enter this into the input. (you might have to use `http` for the initial connection request).

After filling in the input, head over to your physical device.

- First, click on the sync button on your bridge.
- After clicking the button, click the connect button on the website.

If you've pressed the button long enough and clicked connect quick enough you should get a response that contains your credentials. Copy these into your `.env` file, and then relaunch the dev server. You can now navigate to the root route `/`.

To host the website on your local network, run the dev command with the `--host` flag, and optionally the `--port [port]` flag to specify which port you want to expose.
