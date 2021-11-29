let bigBody = document.querySelector("#bigBody")
let iframe = document.querySelector('iframe')
let links = {
    login: iframe.contentWindow.document.querySelectorAll('.loginLink'),
    register: iframe.contentWindow.document.querySelectorAll('.loginLink'),
    mappage: iframe.contentWindow.document.querySelectorAll('.mapLink'),
    profile: iframe.contentWindow.document.querySelectorAll('.profileLink'),
    home: iframe.contentWindow.document.querySelectorAll('.homeLink'),
    loading: iframe.contentWindow.document.querySelectorAll('.loadingLink')
}
if (!sessionStorage.page || sessionStorage.page === '') {
    sessionStorage.setItem("page", 'loading');
    iframe.id = 'loading'
    iframe.src = "./pages/" + 'loading' + ".html"
    iframe.title = 'loading'
}
else {
    if (sessionStorage.cp) {
        sessionStorage.removeItem("cp");
        let page = sessionStorage.page
        iframe.id = page
        if (page === 'mappage') page = 'map'
        iframe.src = "./pages/" + page + ".html"
        iframe.title = page
    } else {
        let page
        if (iframe.id) {
            page = iframe.id
        } else {
            page = sessionStorage.page
        }
        sessionStorage.setItem("page", page);
        if (page === 'mappage') page = 'map'
        iframe.src = "./pages/" + page + ".html"
        iframe.title = page
    }


}

function submitRedirect() {
    iframe.contentWindow.document.querySelectorAll('form').forEach(form => {
        form.querySelector('[type="submit"]').onclick = () => {
            console.log(form.querySelector('[type="submit"]'))
            if (form.querySelector('[type="submit"]').name) {
                let allAreFilled = true;
                form.querySelectorAll("[required]").forEach(req => {
                    if (!allAreFilled) return;
                    if (!req.value) allAreFilled = false;
                })
                if (allAreFilled) {
                    setIframe(form.querySelector('[type="submit"]').name)
                }
            } else {
                console.log('hehe')
                submitRedirect()
            }

        }
    })
}

function searchLinks() {
    for (let i in links) {
        links[i] = iframe.contentWindow.document.querySelectorAll('.' + i + 'Link')
        links[i].forEach(link => {
            console.log(link);
            link.addEventListener('mousedown', e => {
                setIframe(i)
            });
        })
    }
}
function setIframe(name) {
    console.log(name)
    sessionStorage.setItem("page", name);
    sessionStorage.setItem("cp", 'ok');
    location.reload();
}
iframe.addEventListener('load', () => {
    if (iframe.id === 'loading') {
        console.log(iframe.id)
        setTimeout(() => {
            setIframe('home')
        }, 2000);
    }
    searchLinks();
    submitRedirect();
}, true);
if (iframe.id === 'loading') {
    console.log(iframe.id)
    setTimeout(() => {
        setIframe('home')
    }, 2000);
}


