# Mux Spaces Broadcast Layouts

These are a set of [LiveKit compatible](https://docs.livekit.io/server/egress/custom-template/) layouts for their composite recording functionality.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Usage in LiveKit

After you deploy these to vercel or using Mux's Vercel deployment `https://mux-spaces-broadcast-layouts.vercel.app/` you can
specify a `customBaseUrl` when starting your [`RoomCompositeEgress`](https://docs.livekit.io/server/egress/room-composite/#starting-a-roomcomposite)

## Layouts 

When starting your `RoomCompositeEgress` one of the parameters is `layout`, based on what you pass in you'll get one of three options:

### `gallery`
The Gallery layout evenly spaces out participants like you would expect in a typical online meeting. When a screen share is present, the layout allocates more space to the screen share while still rendering your participants’ video and audio.

### `active-speaker`
The Active Speaker layout focuses on one participant at a time and is useful when you need to focus on whoever is speaking, like in a webinar. As with Gallery, this layout also shows the screen share while still rendering the active speaking participant.

### `crop`
Crop is designed to maximize the use of your livestream’s pixel real estate, regardless of how many participants you have.
Crop is most beneficial when you have only 2 or 3 people on-stream. It crops the input video on the fly, squeezing in the edges, so it's best to advise your participants to stay centered in their own camera view.
