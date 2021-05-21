me -> browser http://localhost:3001
-> next.js server
    -> request graphql server localhost:4001
    -> building HTML
    -> sending back to browser

nextjs renders initial page on server and subsequent pages on client (assuming you're using next/link)
