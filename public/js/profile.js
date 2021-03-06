let profile = document.querySelector('#profileContent')
let settingswrapper = profile.querySelector('.left>.Settings')
let settings = settingswrapper.querySelector('div')
let buttonsSettings = document.querySelector('#buttonsSettings')
let scrollSettings = document.querySelector('#ScrollSettings')
let addGroups = document.querySelector('.addGroupsWrapper')
let openAddGroups = false
buttonsSettings.addEventListener('click', e => {
    if (e.target.classList.contains("b1")) {
        settings.scrollTo({ left: 0, behavior: 'smooth' });
        scrollSettings.style.marginLeft = '0'
    }
    else if (e.target.classList.contains("b2")) {
        scrollSettings.style.marginLeft = '50%'
        settings.scrollTo({ left: settings.scrollWidth, behavior: 'smooth' });
    }
})

addGroups.addEventListener('click', (e) => {
    addGroups.querySelector('input[type="text"]').style.width = '90%'
    addGroups.querySelector('input[type="text"]').style.padding = '1.5vh 1.5vh'
    addGroups.querySelector('input[type="text"]').focus()
    addGroups.querySelector('input[type="button"]').style.width ='0'
    addGroups.querySelector('input[type="button"]').style.padding = '1.5vh 0'
    addGroups.querySelector('.addGroups').style.display = 'none'
    addGroups.querySelector('.addButton').style.fill = 'black'
    if(openAddGroups && (e.target.classList.contains("addButton") || e.target.parentElement.classList.contains("addButton"))){
        let newNode = document.createElement("div")
        newNode.innerHTML=`<input type="text" disabled="disabled" value="Teams Marketing" /><svg
        width="42" height="22" viewBox="0 0 42 22" class="groups"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M21 12.3125C23.8525 12.3125 26.3725 12.995 28.42 13.8875C30.31 14.7275 31.5 16.6175 31.5 18.665V21.5H10.5V18.6825C10.5 16.6175 11.69 14.7275 13.58 13.905C15.6275 12.995 18.1475 12.3125 21 12.3125ZM7 12.75C8.925 12.75 10.5 11.175 10.5 9.25C10.5 7.325 8.925 5.75 7 5.75C5.075 5.75 3.5 7.325 3.5 9.25C3.5 11.175 5.075 12.75 7 12.75ZM8.9775 14.675C8.33 14.57 7.6825 14.5 7 14.5C5.2675 14.5 3.6225 14.8675 2.135 15.515C0.84 16.075 0 17.335 0 18.7525V21.5H7.875V18.6825C7.875 17.23 8.2775 15.865 8.9775 14.675ZM35 12.75C36.925 12.75 38.5 11.175 38.5 9.25C38.5 7.325 36.925 5.75 35 5.75C33.075 5.75 31.5 7.325 31.5 9.25C31.5 11.175 33.075 12.75 35 12.75ZM42 18.7525C42 17.335 41.16 16.075 39.865 15.515C38.3775 14.8675 36.7325 14.5 35 14.5C34.3175 14.5 33.67 14.57 33.0225 14.675C33.7225 15.865 34.125 17.23 34.125 18.6825V21.5H42V18.7525ZM21 0.5C23.905 0.5 26.25 2.845 26.25 5.75C26.25 8.655 23.905 11 21 11C18.095 11 15.75 8.655 15.75 5.75C15.75 2.845 18.095 0.5 21 0.5Z" />
    </svg>`
        newNode.classList.add('input','groupsWrapper')
        settings.querySelector('.teams>.input:nth-last-child(2)').insertAdjacentElement('afterend',newNode)
        addGroups.querySelector('input[type="text"]').style.width = '0'
        addGroups.querySelector('input[type="text"]').style.padding = '1.5vh 0vh'
        addGroups.querySelector('input[type="button"]').style.width ='70%'
        addGroups.querySelector('input[type="button"]').style.padding = '1.5vh 1.5vh'
        addGroups.querySelector('.addGroups').style.display = 'block'
        addGroups.querySelector('.addButton').style.fill = 'var(--gray)'
        settings.querySelector('.teams').scrollTop=settings.querySelector('.teams').scrollHeight;
        openAddGroups = false
    }else openAddGroups = true
    
})