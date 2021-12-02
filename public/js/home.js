let activFaq = ''
document.querySelectorAll('.questionWrapper>.check').forEach(faq => {
    faq.addEventListener('click', () => {
        if(faq === activFaq){
            faq.checked = false
            activFaq = ''
        }else{
            activFaq = faq
        }
    })
})