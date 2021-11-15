console.log('boyyyy')

export default function getUser(test) {    
    return $.ajax({
        url: "/searchUserName?username=GuellaRoxane",
        type: "POST",
        dataType: 'text',
        success: function(response, status, http) {
            if (response) {
                console.log(response)
                console.log(JSON.parse(response).data.id)
                $.ajax({
                    url: `/userTweets?id=${JSON.parse(response).data.id}`,
                    type: "POST",
                    success: function(response, status, https) {
                        if (response) {
                            console.log(response._realData.data)
                            test(response._realData.data)
                        }
                    }
                })
            }
        }
    })
}