let register = document.querySelector('#registerContent')
let formWrapper = register.querySelector('.form')
let stageLine = formWrapper.querySelector('#stage')
let form = formWrapper.querySelector('form')
let stage = 1;

const lettre = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
function randomChar() {
    let rdm = Math.floor(Math.random() * 36);
    if (rdm > 9) rdm = lettre[rdm - 10].toUpperCase()
    return rdm
}

let fs1 = `<div>
<div>
    <p>Nom</p>
    <input type='text' class="lastname" placeholder="Nom" required/>
</div>
<div>
    <p>Prénom</p>
    <input type='text' class="firstname" placeholder="Prénom" required />
</div>
</div>
<p>Poste occupé</p>
<input type='text' class="post" placeholder="Poste occupé" required />`

let fs2 = `<p>E-mail</p>
<input type='email' class="email" placeholder="E-mail" required />
<p>Mot de passe</p>
<input type='password' class="pwd" placeholder="Mot de passe" required/>`

let fs3 = `<div id="fs3">
<input type="radio" name="fs3" style="display: none;" class="check" id="solo" value="solo" checked>
<label for="solo">
    <div>
        <img src="../asset/img/solo_icon.svg" />
        <p>Pour moi</p>
        <p>Optimise ton temps, retrouve toutes tes données twitter au même endroit.</p>
    </div>
</label>

<input type="radio" name="fs3" style="display: none;" class="check" id="createGroups" value="createGroups">
<label for="createGroups">
    <div>
        <img src="../asset/img/groups_icon.svg" />
        <p>Avec mon équipe</p>
        <p>Transmets simplement les rapports des campagnes portées à tes collaborateurs.</p>
    </div>
</label>

<input type="radio" name="fs3" style="display: none;" class="check" id="joinGoups" value="joinGoups">
<label for="joinGoups">
    <div>
        <img src="../asset/img/groups_icon.svg" />
        <p>Rejoindre le workspace de mon équipe</p>
        <p>Votre colaborateur vous a transmis un code.</p>
    </div>
</label>
</div>`

let fs4 = `<p>Nom de mon espace d’équipe</p>
<input type='text' class="teamName" placeholder="Nom" required />
<p>E-Mail de mes coéquipiers</p>
<div class="gradientTop"></div>
<div class="teamMails">
<input type='email' class="teamMail" placeholder="E-mail" required/>
<button type="button" class="addMail"><svg width="22" height="22" viewBox="0 0 22 22"
fill="none" xmlns="http://www.w3.org/2000/svg">
<path
    d="M12.5714 12.5714V22H9.42857V12.5714H0V9.42857H9.42857V0H12.5714V9.42857H22V12.5714H12.5714Z" />
</svg></button>
</div>
<div class="gradientBottom"></div>
<p class="copy">ou transmettre un code</p>`


let fs5 = `<div>
<div>
    <p>Nom de l’entreprise</p>
    <input type='text' class="company" placeholder="Entreprise" required />
</div>
<div>
    <p>Twitter de l’entreprise</p>
    <input type='text' class="companyTwitter" placeholder="@Entreprise" required />
</div>
</div>
<div>
<div>
    <p>Secteur d’activité</p>
    <input type='text' class="activity" placeholder="Activité" required />
</div>
<div>
    <p>Localisation du siege sociale</p>
    <input type='text' class="Location" placeholder="Localisation" required />
</div>
</div>`

let fscode = `
<p>Entrée le code de mon équipe</p>
<input type='text' class="post" placeholder="Ex: EA34F6718" required />`

let buttons = `<div class="ou">
<div class="line"></div>
<p>ou</p>
<div class="line"></div>
</div>
<div>
<button class="twitterButton classicButton">
    <svg width="43" height="41" viewBox="0 0 43 41" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6.71533 30.2985C9.994 30.4413 12.9408 29.6758 15.6617 27.7845C12.8424 27.496 10.9356 26.1808 9.88808 23.7043H12.4641L12.5171 23.603C9.55945 22.7211 7.94335 20.8572 7.66337 17.9099L10.3183 18.5984L10.421 18.5315C7.69256 16.3901 7.08396 13.8296 8.55628 10.7162C11.9571 14.4229 16.1233 16.4873 21.338 16.8255C21.338 16.2626 21.3229 15.728 21.338 15.1954C21.3802 13.9319 21.7985 12.7928 22.6774 11.8198C24.9561 9.29472 28.7202 8.92719 31.4691 10.9957C31.9848 11.3835 32.4161 11.4675 33.0258 11.2225C33.9727 10.8428 34.9597 10.5482 36.0829 10.1644C35.7045 10.7881 35.4278 11.3581 35.0397 11.8522C34.6516 12.3463 34.1371 12.7837 33.6917 13.3264L36.7574 12.5296C36.1088 13.4713 35.2945 14.3032 34.3489 14.9899C33.9165 15.2987 33.749 15.6622 33.7479 16.1644C33.7479 19.2889 32.9263 22.2139 31.1686 24.8787C28.4088 29.0603 24.514 31.72 19.2776 32.5381C14.9536 33.2134 10.8707 32.5827 7.06234 30.5061C6.94776 30.4382 6.83208 30.3674 6.71533 30.2985Z" />
    </svg>Se connecter avec Twitter
</button>
<button class="googleButton classicButton"><img src="../asset/img/google_icon.png" />Se connecter
    avec
    Google</button>
</div>`


let rdmText =[
    '67% de toutes les entreprises B2B utilisent Twitter comme outil de marketing digital.',
    '40% des utilisateurs ont effectué un achat après l’avoir vu sur Twitter.',
    'Lançons nous ensemble, et surement.',
    'Dirigez vos campagnes n’a jamais été aussi simple :)'
]

register.querySelector('.left p').innerHTML=rdmText[Math.floor(Math.random()*rdmText.length)]
let submitText = [{ text: 'Suivant', class: 'blueRightButton', onsubmit: 'transformPage(2);' },
{ text: 'Suivant', class: 'blueRightButton', onsubmit: 'transformPage(3);' },
{ text: 'Créer un workspace', class: 'blueCenterButton', onsubmit: '' },
{ text: 'Suivant', class: 'blueRightButton', onsubmit: 'transformPage(5);' },
{ text: 'Inscription', class: 'yellowRightButton', onsubmit: '' }]
function transformPage(i) {
    stage = i
    register.querySelector('.left p').innerHTML=rdmText[Math.floor(Math.random()*rdmText.length)]
    stageLine.querySelector('.frontline').style.width = `calc((25vw - 5vh) / 4 * ${i - 1})`
    stageLine.querySelector('.frontline').style.maxWidth = `calc((600px - 5vh) / 4 * ${i - 1})`
    form.querySelector('section').innerHTML = eval("fs" + i)
    form.querySelector('.submit').value = submitText[i - 1].text
    form.querySelector('.submit').classList.remove("blueRightButton", "blueCenterButton", "yellowRightButton")
    form.querySelector('.submit').classList.remove()
    form.querySelector('.submit').classList.add(submitText[i - 1].class)
    register.querySelector('.left>img').src = `../asset/img/register_${i}.png`
    if (i === 1) {
        formWrapper.querySelector('.buttons').innerHTML = buttons
    } else {
        formWrapper.querySelector('.buttons').innerHTML = ``
    }
    if (i >= 3) {
        stageLine.querySelector('.num:nth-child(4)').style.backgroundColor = 'var(--blue)'
    } else {
        stageLine.querySelector('.num:nth-child(4)').style.backgroundColor = '#6f719b'
    }
    if (i === 5) {
        stageLine.querySelector('.num:nth-child(5)').style.backgroundColor = 'var(--blue)'
    } else {
        stageLine.querySelector('.num:nth-child(5)').style.backgroundColor = '#6f719b'
    }
    console.log(form.querySelector('input'))
    form.querySelector('input').focus()
}

window.addEventListener('load', () => {
    transformPage(stage)
})

document.addEventListener("keyup", function (e) {
    e.preventDefault();
    if (e.keyCode === 39) { if (stage !== 5) transformPage(stage + 1) }
    else if (e.keyCode === 37) if (stage !== 1) transformPage(stage - 1)
});

form.addEventListener("submit", () => {
    if (stage === 3) {
        let data = new FormData(form);
        for (const entry of data) {
            console.log(entry)
            if (entry[1] === "solo") {
                transformPage(5)
            } else if (entry[1] === "createGroups") {
                transformPage(4)
                let groupCode = ""
                for (let i = 0; i < 9; i++) {
                    groupCode += randomChar()
                }
                console.log(groupCode)
                form.querySelector(".copy").innerHTML += `<span style='display:none'>${groupCode}</span>`
            } else {
                transformPage(4)
                form.querySelector('section').innerHTML = fscode
            }
        };
    } else {
        eval(submitText[stage - 1].onsubmit)
    }
});

form.addEventListener('click', e => {
    if (e.target.classList.contains("copy")) {
        let copyText = form.querySelector(".copy>span").innerHTML
        navigator.clipboard.writeText(copyText);
        alert("Votre code de workspace a bien été copié !");
    }
    if (e.target.classList.contains("addMail")||e.target.parentElement.classList.contains("addMail")||e.target.parentElement.parentElement.classList.contains("addMail")) {
        let newNode = document.createElement("input")
        newNode.type = 'email', newNode.classList.add('teamMail'), newNode.placeholder = 'E-mail', newNode.setAttribute("required","")
        form.querySelector('.teamMail:nth-last-child(2)').insertAdjacentElement('afterend',newNode)
        form.querySelector('.teamMail:nth-last-child(2)').focus()
        form.querySelector('.teamMails').scrollTop=form.querySelector('.teamMails').scrollHeight;
    }
},false)



