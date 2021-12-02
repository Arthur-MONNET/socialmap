let activFaq = ''
document.querySelectorAll('.questionWrapper>.check').forEach(faq => {
    faq.addEventListener('click', () => {
        if (faq === activFaq) {
            faq.checked = false
            activFaq = ''
        } else {
            activFaq = faq
        }
    })
})
let labels = document.querySelectorAll('#section2Home>.right>label')
for (let i = 0; i < labels.length; i++) {
    labels[i].addEventListener('click',()=>{
        document.querySelector('#section2home>img').src = '../asset/img/img' + (i + 1) + '_hom2.png'
    })
}
