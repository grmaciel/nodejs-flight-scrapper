// 11pm, global var :(
var startTime;
var timeout;

function waitForRequests(page) {
    let requestPromise = new Promise((resolve, reject) => {
        let listener = function (request) {
            startTime = new Date();

            /**
             * Thing is, we need to wait for all the prices to be loaded, which are async through xhr requests.
             * I can't be 100% sure when this will be over so i added a timeout which after 2 seconds
             * will check the last request elapsed time :(
             */
            clearTimeout(timeout)
            timeout = setTimeout(function () {
                try {
                    var endTime = new Date();
                    var timeDiff = endTime - startTime; // miliseconds
                    // console.log('time diff ' + timeDiff)

                    if (timeDiff >= 1700) {
                        try {
                            page.removeListener('request', listener);
                            resolve()
                        } catch (error) {
                            resolve();
                        }
                    }
                } catch (error) {
                    //fuck it
                }
            }, 1800, startTime)

            request.continue();
        }
        page.on('request', listener);
    })

    // The first promise was hanging in some cases, not sure why 
    // with this we make sure timeout after 10 seconds if somethings goes to shit :(
    return Promise.race([
        requestPromise,
        new Promise(resolve => setTimeout(() => {
            resolve();
        }, 10000)
        )
    ])
}

module.exports = {
    waitForRequests: waitForRequests
};