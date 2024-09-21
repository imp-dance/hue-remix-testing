# Hue-remix light controller app

A simple light controller app made with remix.

![Screenshot 2024-09-19 at 01 26 49](https://github.com/user-attachments/assets/c6aff806-9460-42b9-b906-084533f44a0c)

## Prerequisites

* [Node & NPM](https://nodejs.org/en)

## Launching the project

1. Clone the project. `git clone git@github.com:imp-dance/hue-remix-testing.git`
    * Alternatively, download the project source directly through Github
3. Navigate into the project. `cd hue-remix-testing`
4. Start the dev server. `npm run dev`

You will need to pair your device(s) before opening the root route.

## Pairing with your own devices

1. Create a `.env` file in the root of the project.
2. Install the dependencies `npm i`
3. Launch the dev server. `npm run dev` The terminal will show you the localhost url for the project.
4. Navigate to the `localhost:<port>/connect` route.

### Finding your connection IP

#### Bridge

1. Open up the **Hue** app on your phone.
2. Go to the settings menu in the app.
3. Go to Hue Bridges.
4. Select your bridge. The ip address of the bridge will show.

#### Sync box

1. Open up the **Hue Sync** app on your phone.
2. Go to the settings menu in the app.
3. Go to sync boxes
4. Select your sync box. The ip address of the sync box will show.

### Pairing the bridge

1. Enter the IP of your bridge into the relevant input on the `/connect` route.
2. Go to your physical hue bridge device. Click the sync button and hold it down for just a couple of seconds.
3. Click **Sync with Bridge**.
4. Copy the credentials into your `.env` file as prompted.

### Pairing the sync box

1. Enter the IP of your sync box into the relevant input on the `/connect` route.
2. Go to your physical sync box device. Hold down the main button for 5 seconds until it blinks.
3. Click **Sync with sync Box**.
4. Copy the credentials into your `.env` file as prompted.

## Local hosting

To host the website on your local network, run the dev command with the `--host` flag, and optionally the `--port [port]` flag to specify which port you want to expose.
