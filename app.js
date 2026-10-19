/* Shakil Store — Supabase-backed public catalog */
const SUPABASE_URL = "https://xqdzavnoyfuglquhjuqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_IaTsiI3f_IyQqaBBCbd_tA_pKqX4feb";
const ADMIN_EMAIL = "mdshakil162025@gmail.com";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB3nsJhE6zdnYY8e9I5ZA1knkcCkZcF9UU",
  authDomain: "shakil-dev-pro.firebaseapp.com",
  projectId: "shakil-dev-pro",
  appId: "1:772040366682:web:d5d1e1335be6a6da59d663"
};
if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
const firebaseAuth = firebase.auth();
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  accessToken: async () => {
    const user = firebaseAuth.currentUser;
    return user ? await user.getIdToken() : null;
  }
});
let storeItems = [], socialLinks = {youtube:"https://www.youtube.com/@ShakilX9X",telegram:"https://t.me/Shakil_X9X",tiktok:"https://tiktok.com/@shakil.5090",facebook:"#"};
let editingItem = null;
let isRecoveryMode = false;
document.addEventListener("DOMContentLoaded", async () => {
  renderSocialLinks(); initCanvasBackground();
  await loadSettings(); await loadItems();
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "resetPassword" && params.get("oobCode")) {
    isRecoveryMode = true;
    document.getElementById("adminAuthModal").classList.remove("hidden");
    document.getElementById("adminAuthEmail").closest("div").classList.add("hidden");
    document.getElementById("adminAuthPass").placeholder = "নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)";
    document.querySelector("#adminAuthModal h3").textContent = "নতুন পাসওয়ার্ড সেট করুন";
    document.querySelector("#adminAuthModal form button[type=submit]").textContent = "পাসওয়ার্ড সেভ করুন";
  }
});
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatFileSize(n){if(!n)return "0 Bytes";const u=["Bytes","KB","MB","GB","TB"],i=Math.min(Math.floor(Math.log(n)/Math.log(1024)),u.length-1);return (n/Math.pow(1024,i)).toFixed(1)+" "+u[i];}
function toast(msg){showToast(msg)}
async function loadSettings(){
 const {data,error}=await db.from("store_settings").select("value").eq("key","socials").maybeSingle();
 if(!error&&data?.value) socialLinks={...socialLinks,...data.value};
 renderSocialLinks();
}
async function loadItems(){
 const {data,error}=await db.from("store_items").select("*").order("created_at",{ascending:false});
 if(error){console.error(error);showToast("ডাটাবেজ লোড হয়নি — Supabase সেটিংস যাচাই করুন");return;}
 storeItems=data||[]; renderStoreItems(document.getElementById("searchInput")?.value||"");
}
function renderSocialLinks(){
 const ids={youtube:"linkYoutube",telegram:"linkTelegram",tiktok:"linkTiktok",facebook:"linkFacebook"};
 for(const [k,id] of Object.entries(ids)){const a=document.getElementById(id);if(!a)continue;const href=socialLinks[k]||"#";a.href=href;if(k==="facebook"&&href==="#")a.classList.add("hidden");else a.classList.remove("hidden");}
 for(const [k,id] of Object.entries({youtube:"inputYoutube",telegram:"inputTelegram",tiktok:"inputTiktok",facebook:"inputFacebook"})){const el=document.getElementById(id);if(el)el.value=socialLinks[k]||"";}
}
function renderStoreItems(q=""){
 const ag=document.getElementById("apkGrid"),cg=document.getElementById("codeGrid"),list=document.getElementById("adminItemsList");if(!ag||!cg||!list)return;
 ag.innerHTML="";cg.innerHTML="";list.innerHTML="";
 const filtered=storeItems.filter(x=>(x.title||"").toLowerCase().includes(q.toLowerCase()));
 const apks=filtered.filter(x=>x.type==="apk"),codes=filtered.filter(x=>x.type!=="apk");
 document.getElementById("apkCount").textContent="Total: "+apks.length;document.getElementById("codeCount").textContent="Total: "+codes.length;
 apks.forEach(x=>ag.appendChild(createCard(x,true)));codes.forEach(x=>cg.appendChild(createCard(x,false)));storeItems.forEach(x=>list.appendChild(createAdminItemRow(x)));
 if(!apks.length)ag.innerHTML=emptyState("এখনো কোনো APK আপলোড করা হয়নি!");
 if(!codes.length)cg.innerHTML=emptyState("এখনো কোনো সোর্স কোড আপলোড করা হয়নি!");
}
function emptyState(msg){return '<div class="col-span-full text-center py-12 glass-card rounded-2xl"><i class="fa-solid fa-box-open text-4xl text-brand-400/50 mb-3"></i><p class="text-sm text-gray-400">'+escapeHtml(msg)+'</p></div>';}
function createCard(item,isApk){
 const card=document.createElement("div");card.className="glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 border border-brand-500/20";
 const icon=item.icon_url||"https://cdn-icons-png.flaticon.com/512/1157/1157109.png";
 card.innerHTML='<div><div class="flex items-center gap-3 mb-3">'+(isApk?'<img src="'+escapeHtml(icon)+'" alt="" class="w-14 h-14 rounded-2xl object-cover border border-brand-400/30 p-1">':'<div class="w-11 h-11 rounded-xl bg-brand-900/80 flex items-center justify-center text-brand-400"><i class="fa-solid fa-file-zipper text-xl"></i></div>')+'<div class="flex-1 overflow-hidden"><h3 class="font-bold text-white truncate">'+escapeHtml(item.title)+'</h3><span class="text-[10px] text-brand-400">'+formatFileSize(item.size_bytes||0)+'</span></div></div></div><div class="pt-3 border-t border-brand-500/20 flex items-center justify-between mt-2"><span class="text-[11px] text-gray-400"><i class="fa-solid fa-download text-brand-400"></i> '+(item.downloads||0)+' Downloads</span><button class="get-file px-3.5 py-1.5 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl text-xs"><i class="fa-solid fa-circle-down"></i> '+(isApk?"GET":"ডাউনলোড")+'</button></div>';
 card.querySelector("button").addEventListener("click",()=>downloadFile(item.id));return card;
}
function createAdminItemRow(item){
 const row=document.createElement("div");row.className="flex items-center justify-between gap-2 p-2.5 bg-brand-900/60 rounded-xl border border-brand-500/20 text-xs";
 row.innerHTML='<div class="min-w-0"><span class="font-semibold text-white">'+escapeHtml(item.title)+'</span><span class="block text-[10px] text-gray-400">'+escapeHtml(item.type)+' · '+formatFileSize(item.size_bytes||0)+'</span></div><div class="flex gap-1"><button class="edit text-brand-400 p-1.5" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button><button class="delete text-red-400 p-1.5" title="Delete"><i class="fa-solid fa-trash-can"></i></button></div>';
 row.querySelector(".edit").onclick=()=>startEditingItem(item.id);row.querySelector(".delete").onclick=()=>deleteItem(item.id);return row;
}
async function downloadFile(id){
 const item=storeItems.find(x=>x.id===id);if(!item)return;
 try{
  const {data}=db.storage.from("store-files").getPublicUrl(item.file_path);
  if(!data?.publicUrl)throw new Error("ডাউনলোড URL পাওয়া যায়নি");
  const a=document.createElement("a");a.href=data.publicUrl;a.download=item.file_name||item.title;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
  const result=await db.from("store_items").update({downloads:(item.downloads||0)+1}).eq("id",id);
  if(!result.error){item.downloads=(item.downloads||0)+1;renderStoreItems(document.getElementById("searchInput").value);}
  showToast("ডাউনলোড লিংক খোলা হয়েছে");
 }catch(error){console.error("Public download failed:",error);showToast("ডাউনলোড ব্যর্থ: "+(error.message||"আবার চেষ্টা করুন"),"error");}
}
function switchTab(tab){const a=document.getElementById("appsSection"),c=document.getElementById("codesSection");a.classList.toggle("hidden",tab!=="apps");c.classList.toggle("hidden",tab!=="codes");document.getElementById("tabBtnApps").classList.toggle("tab-btn-active",tab==="apps");document.getElementById("tabBtnCodes").classList.toggle("tab-btn-active",tab==="codes");}
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("-translate-x-full");document.getElementById("sidebarOverlay").classList.toggle("hidden");}
function filterItems(){renderStoreItems(document.getElementById("searchInput").value);}
function openAdminAuthModal(){if(!document.getElementById("sidebar").classList.contains("-translate-x-full"))toggleSidebar();document.getElementById("adminAuthModal").classList.remove("hidden");}
function closeAdminAuthModal(){document.getElementById("adminAuthModal").classList.add("hidden");document.getElementById("authErrorMsg").classList.add("hidden");}
async function handleForgotPassword(){
 const email=document.getElementById("adminAuthEmail").value.trim();
 const msg=document.getElementById("authErrorMsg");
 msg.classList.remove("hidden");msg.classList.remove("text-green-400");msg.classList.add("text-red-400");
 if(!email){msg.innerText="আগে আপনার ইমেইল লিখুন, তারপর Forgot Password চাপুন।";return;}
 if(email.toLowerCase()!==ADMIN_EMAIL){msg.innerText="এই ইমেইলের জন্য পাসওয়ার্ড রিসেট অনুমোদিত নয়।";return;}
 try{
  await firebaseAuth.sendPasswordResetEmail(email,{url:window.location.origin+window.location.pathname,handleCodeInApp:false});
  msg.classList.remove("text-red-400");msg.classList.add("text-green-400");
  msg.innerText="পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে। Inbox/Spam দেখুন।";
  showToast("রিসেট ইমেইল পাঠানো হয়েছে");
 }catch(error){msg.innerText="রিসেট ইমেইল পাঠানো যায়নি: "+friendlyAuthError(error);}
}
function friendlyAuthError(error){
 const code=error?.code||"";
 const messages={
  "auth/invalid-credential":"ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/invalid-login-credentials":"ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/user-not-found":"এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",
  "auth/wrong-password":"পাসওয়ার্ড ভুল।",
  "auth/too-many-requests":"অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
  "auth/network-request-failed":"ইন্টারনেট সংযোগ যাচাই করুন।",
  "auth/invalid-email":"সঠিক ইমেইল লিখুন।",
  "auth/weak-password":"পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন।",
  "auth/expired-action-code":"রিসেট লিংকের মেয়াদ শেষ। নতুন লিংক নিন।",
  "auth/invalid-action-code":"রিসেট লিংকটি সঠিক নয় বা মেয়াদ শেষ।"
 };
 return messages[code]||"সমস্যা হয়েছে। ইন্টারনেট ও Firebase Authentication সেটিংস যাচাই করুন।";
}
async function handleAdminLogin(e){
 e.preventDefault();
 const email=document.getElementById("adminAuthEmail").value.trim().toLowerCase();
 const password=document.getElementById("adminAuthPass").value;
 const btn=document.querySelector("#adminAuthModal form button[type=submit]");
 const msg=document.getElementById("authErrorMsg");
 const originalText=isRecoveryMode?"পাসওয়ার্ড সেভ করুন":"লগইন করুন";
 btn.disabled=true;btn.textContent=isRecoveryMode?"সেভ হচ্ছে…":"লগইন হচ্ছে…";
 msg.classList.add("hidden");
 try{
  if(isRecoveryMode){
   if(password.length<8)throw new Error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন।");
   const code=new URLSearchParams(window.location.search).get("oobCode");
   if(!code)throw new Error("রিসেট লিংকটি অসম্পূর্ণ। নতুন রিসেট লিংক নিন।");
   await firebaseAuth.confirmPasswordReset(code,password);
   isRecoveryMode=false;
   history.replaceState(null,"",window.location.pathname);
   document.getElementById("adminAuthEmail").closest("div").classList.remove("hidden");
   document.getElementById("adminAuthPass").value="";
   document.getElementById("adminAuthPass").placeholder="পাসওয়ার্ড লিখুন...";
   document.querySelector("#adminAuthModal h3").textContent="এডমিন প্রবেশের অনুমতি";
   btn.textContent="লগইন করুন";
   showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে");
   msg.classList.remove("hidden","text-red-400");msg.classList.add("text-green-400");
   msg.innerText="পাসওয়ার্ড পরিবর্তন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।";
   return;
  }
  if(email!==ADMIN_EMAIL)throw new Error("এই ইমেইলে Admin অনুমতি নেই।");
  await firebaseAuth.signInWithEmailAndPassword(email,password);
  const user=firebaseAuth.currentUser;
  if(!user||user.email?.toLowerCase()!==ADMIN_EMAIL){
   await firebaseAuth.signOut();
   throw new Error("এই অ্যাকাউন্টে Admin অনুমতি নেই।");
  }
  closeAdminAuthModal();
  document.getElementById("adminDashboardModal").classList.remove("hidden");
  showToast("Login Successful! এডমিন প্যানেলে স্বাগতম");
 }catch(error){
  console.error("Admin login error:",error);
  msg.classList.remove("hidden","text-green-400");msg.classList.add("text-red-400");
  msg.innerText=error.message&&!error.code?error.message:friendlyAuthError(error);
  showToast("লগইন ব্যর্থ: "+msg.innerText,"error");
 }finally{
  btn.disabled=false;
  if(!isRecoveryMode)btn.textContent="লগইন করুন";
  else btn.textContent=originalText;
 }
}
async function closeAdminDashboard(){document.getElementById("adminDashboardModal").classList.add("hidden");resetFormState();await firebaseAuth.signOut();}
async function handleChangePassword(e){e.preventDefault();const p=document.getElementById("newAdminPass").value;if(p.length<8){showToast("কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন","error");return;}try{const user=firebaseAuth.currentUser;if(!user)throw new Error("আগে Admin লগইন করুন");await user.updatePassword(p);document.getElementById("newAdminPass").value="";showToast("পাসওয়ার্ড পরিবর্তন হয়েছে");}catch(error){showToast(friendlyAuthError(error),"error");}}
async function handleSaveSocials(e){e.preventDefault();const next={youtube:document.getElementById("inputYoutube").value,telegram:document.getElementById("inputTelegram").value,tiktok:document.getElementById("inputTiktok").value,facebook:document.getElementById("inputFacebook").value||"#"};const {error}=await db.from("store_settings").upsert({key:"socials",value:next,updated_at:new Date().toISOString()});if(error){showToast("সেভ হয়নি: Admin অনুমতি যাচাই করুন");return;}socialLinks=next;renderSocialLinks();showToast("সোশ্যাল লিঙ্ক আপডেট হয়েছে");}
function startEditingItem(id){editingItem=storeItems.find(x=>x.id===id);if(!editingItem)return;document.getElementById("editingItemId").value=id;document.getElementById("uploadType").value=editingItem.type;document.getElementById("uploadTitle").value=editingItem.title;document.getElementById("uploadIconUrl").value=editingItem.icon_url||"";document.getElementById("formPanelTitle").innerHTML='<i class="fa-solid fa-pen-to-square"></i> এডিট করছেন: '+escapeHtml(editingItem.title);document.getElementById("cancelEditBtn").classList.remove("hidden");document.getElementById("uploadSubmitBtn").innerHTML="পরিবর্তন সেভ করুন";document.getElementById("formPanelTitle").scrollIntoView({behavior:"smooth"});}
function resetFormState(){editingItem=null;document.getElementById("editingItemId").value="";document.getElementById("uploadType").value="apk";document.getElementById("uploadTitle").value="";document.getElementById("uploadIconUrl").value="";document.getElementById("uploadIconFile").value="";document.getElementById("uploadFileAttachment").value="";document.getElementById("formPanelTitle").innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i> নতুন ফাইল আপলোড করুন';document.getElementById("cancelEditBtn").classList.add("hidden");document.getElementById("uploadSubmitBtn").innerHTML='<i class="fa-solid fa-plus"></i> আপলোড ও প্রকাশ করুন';document.getElementById("fileAttachLabel").innerText="ফাইল যুক্ত করুন (APK, ZIP, HTML, ভিডিও)";}
async function handleItemUploadOrUpdate(e){
 e.preventDefault();const btn=document.getElementById("uploadSubmitBtn"),id=document.getElementById("editingItemId").value,type=document.getElementById("uploadType").value,title=document.getElementById("uploadTitle").value.trim(),file=document.getElementById("uploadFileAttachment").files[0],iconFile=document.getElementById("uploadIconFile").files[0],iconUrl=document.getElementById("uploadIconUrl").value.trim();
 btn.disabled=true;btn.innerHTML="আপলোড হচ্ছে…";
 try{
  const adminUser=firebaseAuth.currentUser;if(!adminUser)throw new Error("আগে Admin লগইন করুন");if((adminUser.email||"").toLowerCase()!==ADMIN_EMAIL)throw new Error("এই অ্যাকাউন্টে Admin অনুমতি নেই।");
  let old=id?storeItems.find(x=>x.id===id):null;if(!title)throw new Error("অ্যাপ বা ফাইলের নাম লিখুন");if(!old&&!file)throw new Error("নতুন ফাইল নির্বাচন করুন");
  let file_path=old?.file_path,file_name=old?.file_name,size_bytes=old?.size_bytes||0;
  if(file){const safeName=file.name.replace(/[^\w.\-]+/g,"_"),path=crypto.randomUUID()+"-"+safeName;const {error}=await db.storage.from("store-files").upload(path,file,{upsert:false,contentType:file.type||"application/octet-stream"});if(error)throw error;file_path=path;file_name=file.name;size_bytes=file.size;}
  let icon_url=old?.icon_url||"https://cdn-icons-png.flaticon.com/512/1157/1157109.png";
  if(iconFile){const path="icons/"+crypto.randomUUID()+"-"+iconFile.name.replace(/[^\w.\-]+/g,"_");const {error}=await db.storage.from("store-files").upload(path,iconFile,{upsert:false,contentType:iconFile.type||"image/png"});if(error)throw error;icon_url=db.storage.from("store-files").getPublicUrl(path).data.publicUrl;}else if(iconUrl)icon_url=iconUrl;
  const payload={type,title,file_name,file_path,size_bytes,icon_url,updated_at:new Date().toISOString()};
  const result=old?await db.from("store_items").update(payload).eq("id",id):await db.from("store_items").insert(payload);
  if(result.error)throw result.error;showToast(old?"ফাইল আপডেট হয়েছে":"ফাইল আপলোড ও প্রকাশ হয়েছে");resetFormState();await loadItems();
 }catch(err){console.error("Upload failed:",err);showToast("আপলোড ব্যর্থ: "+(err.message||"ফাইল আপলোড হয়নি"),"error");}finally{btn.disabled=false;if(editingItem)btn.innerHTML="পরিবর্তন সেভ করুন";else btn.innerHTML='<i class="fa-solid fa-plus"></i> আপলোড ও প্রকাশ করুন';}
}
async function deleteItem(id){if(!confirm("আপনি কি এই ফাইলটি মুছে ফেলতে চান?"))return;const item=storeItems.find(x=>x.id===id);if(!item)return;const {error}=await db.from("store_items").delete().eq("id",id);if(error){showToast("মুছতে ব্যর্থ — Admin অনুমতি যাচাই করুন");return;}await db.storage.from("store-files").remove([item.file_path]);await loadItems();showToast("ফাইল মুছে ফেলা হয়েছে");}
let toastTimer;
function showToast(msg,type="success"){
 const t=document.getElementById("toast"),icon=t.querySelector("i");
 document.getElementById("toastMsg").innerText=msg;
 t.classList.remove("bg-brand-500","bg-red-600","border-white/20","translate-y-20","opacity-0");
 t.classList.add(type==="error"?"bg-red-600":"bg-brand-500","border-white/20");
 icon.className=type==="error"?"fa-solid fa-circle-exclamation text-lg":"fa-solid fa-circle-check text-lg";
 t.classList.remove("translate-y-20","opacity-0");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add("translate-y-20","opacity-0"),4000);
}
function initCanvasBackground(){const canvas=document.getElementById("bg-canvas");if(!canvas)return;const ctx=canvas.getContext("2d");function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}resize();addEventListener("resize",resize);const ps=Array.from({length:40},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+.5,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,a:Math.random()*.5+.2}));function frame(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const p of ps){p.x=(p.x+p.vx+canvas.width)%canvas.width;p.y=(p.y+p.vy+canvas.height)%canvas.height;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(52,211,153,"+p.a+")";ctx.fill();}requestAnimationFrame(frame);}frame();}
