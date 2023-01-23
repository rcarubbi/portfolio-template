import projects from './projects.js';

const firstProjectIndex = 0;
const lastProjectIndex = projects.length - 1
let currentProjectIndex = 0;

function renderProjectDetails(i) {
  const { image, text, url } = projects[i];

  $('#project-detail-image').attr('src', `/assets/img/${image}`);
  $('#project-text').text(text);
  $('#project-link').attr('href', url)

  currentProjectIndex = i;  

  $('#project-details').addClass('show');
  $('#project-carousel').addClass('hidden');
  $('#project-ring').addClass('locked');

  $('#prev-project-btn').prop('disabled', currentProjectIndex === firstProjectIndex);
  $('#next-project-btn').prop('disabled', currentProjectIndex === lastProjectIndex);
}

function selectPrevProject() {
  if (currentProjectIndex > 0) currentProjectIndex--;

  renderProjectDetails(currentProjectIndex);
}

function selectNextProject() {
  if (currentProjectIndex < 9) currentProjectIndex++;

  renderProjectDetails(currentProjectIndex);
}

const projectRing = $('#project-ring');
let clickStart = 0;

projects.forEach((project, i) => {
  $('<div />', {
    role: 'button',
    tabIndex: '0',
    class: 'project__cimage',
    css: { backgroundImage: `url(/assets/img/${project.image})` },
  })
    .on('mousedown touchstart', () => {
      clickStart = Date.now();
    })
    .on('mouseup touchend', () => {
      const now = Date.now();
      if (now - clickStart > 200) return;

      renderProjectDetails(i);
    })
    .appendTo(projectRing);
});

$('#project-close-btn').on('mouseup touchend', () => {
  $('#project-details').removeClass('show');
  $('#project-carousel').removeClass('hidden');
  $('#project-ring').removeClass('locked');
});


$('#prev-project-btn').on('mouseup touchend', selectPrevProject);
$('#next-project-btn').on('mouseup touchend', selectNextProject);

// source: https://codepen.io/creativeocean/pen/mdROBXx

let xPos = 0;

gsap.timeline()
  .set('.project__ring', { rotationY:180, cursor:'grab' }) //set initial rotationY so the parallax jump happens off screen
  .set('.project__cimage',  { // apply transform rotations to each image
    rotateY: (i)=> i*-36,
    transformOrigin: '50% 50% 500px',
    z: -500,
    backgroundPosition:(i)=>getBgPos(i),
    backfaceVisibility:'hidden'
  })    
  .from('.project__cimage', {
    duration:1.5,
    y:200,
    opacity:0,
    stagger:0.1,
    ease:'expo'
  })
  .add(()=>{
    $('.project__cimage').on('mouseenter', (e)=>{
      let current = e.currentTarget;
      gsap.to('.project__cimage', {opacity:(i,t)=>(t==current)? 1:0.5, ease:'power3'})
    })
    $('.project__cimage').on('mouseleave', (e)=>{
      gsap.to('.project__cimage', {opacity:1, ease:'power2.inOut'})
    })
  }, '-=0.5')

$('#project-ring').on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);
      

function dragStart(e){ 
  if (e.touches) e.clientX = e.touches[0].clientX;
  xPos = Math.round(e.clientX);
  gsap.set('.project__ring', {cursor:'grabbing'})
  $(window).on('mousemove touchmove', drag);
}


function drag(e){
  if (e.touches) e.clientX = e.touches[0].clientX;    

  gsap.to('.project__ring', {
    rotationY: '-=' +( (Math.round(e.clientX)-xPos)%360 ),
    onUpdate:()=>{ gsap.set('.project__cimage', { backgroundPosition:(i)=>getBgPos(i) }) }
  });
  
  xPos = Math.round(e.clientX);
}


function dragEnd(e){
  $(window).off('mousemove touchmove', drag);
  gsap.set('.project__ring', {cursor:'grab'});
}


function getBgPos(i){ //returns the background-position string to create parallax movement in each image
  return ( 100-gsap.utils.wrap(0,360,gsap.getProperty('.project__ring', 'rotationY')-180-i*36)/360*500 )+'px 0px';
}

const fillAnimatedTexts = document.querySelectorAll('[data-fill-animate]');
const syncFillAnimateWithTextContent = (node) => node.setAttribute('data-fill-animate', node.textContent);
const cb = () => fillAnimatedTexts.forEach(syncFillAnimateWithTextContent);
const observer = new MutationObserver(cb);

fillAnimatedTexts.forEach((node) => {
  syncFillAnimateWithTextContent(node);
  observer.observe(node, { characterData: true, subtree: true });
});
