// GRANI ヘアミルクのチューブを three.js で立体表示する（実写の代わりの3Dイメージ）
import * as THREE from './three.module.min.js';

function makeLabel(opts){
  // 実物（グレーのマットチューブ）に合わせたラベル。正面は u=0.75（canvas x=1536）
  const W=2048,H=2048,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,opts.body2);g.addColorStop(1,opts.body);
  x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<60000;i++){const v=Math.random()*30|0;x.fillStyle=`rgba(${v},${v},${v},0.05)`;x.fillRect(Math.random()*W,Math.random()*H,2,2)}
  const PU=906,SX=1.2,cx=1536; // 横1単位=906px、縦は 2048/2.7=758px。文字は横に1.2倍して正円比に
  const X=u=>cx+u*PU, Y=f=>f*H;
  function txt(str,u,f,font,col,ls=0){x.save();x.translate(X(u),Y(f));x.scale(SX,1);x.font=font;x.fillStyle=col;x.textAlign='left';x.textBaseline='alphabetic';
    if(ls){let p=0;for(const ch of str){x.fillText(ch,p,0);p+=x.measureText(ch).width+ls}}else x.fillText(str,0,0);x.restore()}
  txt('HAIR MILK',-0.14,0.185,'400 50px Outfit, Montserrat, sans-serif','rgba(255,255,255,.92)',3);
  txt('GRA',-0.165,0.318,'700 182px Outfit, Montserrat, sans-serif',opts.logo,-3);
  txt('NI',-0.165,0.398,'700 182px Outfit, Montserrat, sans-serif',opts.logo,-3);
  // 右側の縦組み（上から下へ読む）
  x.save();x.translate(X(0.115),Y(0.575));x.scale(SX,1);x.rotate(Math.PI/2);x.font='italic 400 31px "Cormorant Garamond", Georgia, serif';x.fillStyle='rgba(255,255,255,.78)';
  ['luminosité et humidité','hydratation des cheveux','utilisation quotidienne'].forEach((t,i)=>x.fillText(t,0,i*34));x.restore();
  txt('MAKEit',-0.175,0.968,'500 34px "Cormorant Garamond", Georgia, serif','rgba(255,255,255,.85)');
  txt('200ml/6.8fl.oz',0.06,0.968,'400 22px Outfit, sans-serif','rgba(255,255,255,.8)');
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

function tubeGeometry(){
  // y=-1（キャップ側・円）→ y=+1（シール側・平ら）へ断面が変化するチューブ
  const seg=128,rows=96,r=0.36,pos=[],uv=[],idx=[];
  for(let j=0;j<=rows;j++){
    const v=j/rows,y=-1+2*v,t=Math.pow(Math.max(0,(v-0.08)/0.92),1.6);
    for(let i=0;i<=seg;i++){
      const a=i/seg*Math.PI*2;
      const sx=r*(1+0.42*t),sz=r*Math.max(0.025,1-t*1.02);
      pos.push(Math.cos(a)*sx,y*1.35,Math.sin(a)*sz);uv.push(1-i/seg,v);
    }
  }
  for(let j=0;j<rows;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}

export async function mountTube(canvas,o={}){
  const opts=Object.assign({pink:'#FF2E93',logo:'#C4549A',body:'#555459',body2:'#636267',bg:null,auto:0.25,light:'#ffffff',rim:'#FF2E93'},o);
  try{await Promise.all([document.fonts.load('700 182px Outfit'),document.fonts.load('400 50px Outfit'),document.fonts.load('italic 400 27px "Cormorant Garamond"'),document.fonts.load('500 34px "Cormorant Garamond"')])}catch(e){}
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(28,1,0.1,50);cam.position.set(0,0,opts.dist||9.2);
  const group=new THREE.Group();scene.add(group);
  const body=new THREE.Mesh(tubeGeometry(),new THREE.MeshPhysicalMaterial({map:makeLabel(opts),roughness:0.72,metalness:0.0,clearcoat:0.08,clearcoatRoughness:0.8,side:THREE.DoubleSide}));
  group.add(body);
  // シール部（ギザギザの帯）
  const seal=new THREE.Mesh(new THREE.BoxGeometry(0.36*2*1.42+0.02,0.12,0.04),new THREE.MeshStandardMaterial({color:opts.body2,roughness:0.85}));seal.position.y=1.35+0.05;group.add(seal);
  // キャップ（本体と同じグレーのマットなフリップキャップ）
  const capM=new THREE.MeshStandardMaterial({color:'#505055',roughness:0.78});
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.355,0.36,0.36,96),capM);cap.scale.z=0.82;cap.position.y=-1.35-0.18;group.add(cap);
  const cap2=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.355,0.03,96),new THREE.MeshStandardMaterial({color:'#47474c',roughness:0.8}));cap2.scale.z=0.82;cap2.position.y=-1.35-0.015;group.add(cap2);
  const notch=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.1,0.02),new THREE.MeshStandardMaterial({color:'#49494e',roughness:0.85}));notch.position.set(0,-1.35-0.25,0.36*0.82-0.005);group.add(notch);
  group.position.y=0.25;
  // ライティング
  scene.add(new THREE.HemisphereLight('#ffffff','#40384a',0.9));
  const key=new THREE.DirectionalLight(opts.light,2.2);key.position.set(3,4,5);scene.add(key);
  const rim=new THREE.PointLight(opts.rim,26,14);rim.position.set(-3,1,-2);scene.add(rim);
  const rim2=new THREE.PointLight(opts.rim,12,14);rim2.position.set(3,-2,-2.5);scene.add(rim2);
  const fill=new THREE.DirectionalLight('#dfe3ea',0.6);fill.position.set(-4,-1,4);scene.add(fill);
  let mx=0,my=0,tx=0,ty=0,spin=0,heat=0;
  const st={setHeat(v){heat=v},setSpin(v){spin=v},group};
  addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
  function size(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  size();addEventListener('resize',size);
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let t0=performance.now();
  (function loop(t){const dt=(t-t0)/1000;t0=t;tx+=(mx-tx)*0.06;ty+=(my-ty)*0.06;
    if(!reduce)group.rotation.y+=dt*opts.auto;group.rotation.y+=spin*0.0;
    group.rotation.x=ty*0.35;group.rotation.z=-0.12+tx*0.25;group.position.y=0.25+(reduce?0:Math.sin(t/1400)*0.06);
    rim.intensity=26+heat*40;rim2.intensity=12+heat*30;
    renderer.render(scene,cam);requestAnimationFrame(loop)})(t0);
  return st;
}
