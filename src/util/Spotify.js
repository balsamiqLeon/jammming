let accessToken = '';
let expiresIn = '';
const clientID = '2afa74349c2b4570b1d8f1ebcc99856b';
const redirectURI = 'https://leonbarnard.surge.sh';

let Spotify ={

  getAccessToken() {
    let token = window.location.href.match(/access_token=([^&]*)/);
    let expires = window.location.href.match(/expires_in=([^&]*)/);
    if (accessToken) {
      return accessToken;
    }
    else if (token && expires) {
    accessToken = token[1];
    expiresIn = Number(expires[1]);
    window.setTimeout(() => accessToken = '', expiresIn * 1000);
    window.history.pushState('Access Token', null, '/');
    return accessToken;
    }
    else {
     window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
  }
},


search(searchTerm) {
  let token = this.getAccessToken();
  return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
headers: {Authorization: `Bearer ${token}`}
}).then(response => {
  if (response.ok) {
    return response.json();
  }
  throw new Error('Request failed!');
}, networkError => console.log(networkError.message)
).then(jsonResponse => {
return jsonResponse.tracks.items.map(track => ({
id: track.id, name: track.name, artist: track.artists[0].name, album: track.album.name, uri: track.uri}))
})
},

  savePlaylist(playlistName, trackURIs) {
    const token = this.getAccessToken();
    const headers = {Authorization: `Bearer ${token}`};
    let userID = '';
    let playlistID = '';

    if (playlistName && trackURIs) {
      return fetch(`https://api.spotify.com/v1/me/`, {headers: headers}
      ).then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Request failed!');
      }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      userID = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({name: playlistName})
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        playlistID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({uris: trackURIs})
        }).then(response => {
          return response.json();
        }).then(jsonResponse => {
          playlistID = jsonResponse.id;
      });
    });
  })
    }
    else {
    return;}
}


};

export default Spotify;
