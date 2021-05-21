`req.session.userId = user.id` - stores data on session. any data stored on here goes into redis

{ userId: 1 } -> send that to redis

<!-- redis key maps to session object -->
sess:qwefasfawef -> { userId: 1 }

express-session will set a cookie on my browser (qid=q2398akdlfjal3ifj) (signed version of redis key)

when user makes request, cookie is sent to server

server decrypts cookie with secret we set and uses key to look up session in redis