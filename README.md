# rbsync-cloud
#USE at your own risk.
#THIS WORK IS IN PROGRESS AND CURRENTLY NOT FUNCTIONAL. SORRY.

I'm working on group of projects to all syncing of track data of rhythmbox music player between devices. 
This particular application would run on a cloud server (or possibly just on your local linux machine. whatever).
This project is related to my rhythmbox-sync at https://github.com/semlak/rhythmbox-sync. rhythmbox-sync is a plugin for rhythmbox that would connect to this cloud application to help sync data. 

The overall functionality I'm going for is to sync music data between devices.
It does not sync the actual music files, although I am trying to add that functionality. The idea is that if you update a track rating on one device, I would like it to sync across devices. 
For play counts, I would like play counts to reflect the total play count across devices. 
Similar, if you update genre, title, album_name, ...

I would like to add support for some android players, but this would probably require a rooted android device.

This server application uses Node.js and mongodb. It is possible that for a single user you could deploy it to heroku and use some basic authentication, and it is likely the herokue basic user services would be sufficient. Would not allow syncing of actual song files, which I don't have support for anyway.

#Instructions to setup:
This will need to be completed after I get more functionality. The basics would be:
1. Setup rhythmbox-sync plugin on rhythmbox devices
2. Setup rbsync-cloud on some server.
3. Configure plugins on each machine to talk to rbsync-cloud server.
4. Sync devices.

Right now, the security gaurantees for application are basically non-existent. It does not transmit data securely or store data securely. Working on the former, although I doubt I would want to support encryption for the actual storage of the data. I could look to see if MongoDB supports this easily, though.
