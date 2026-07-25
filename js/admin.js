const snap = await getDoc(doc(db,"users",user.uid));

const role = snap.data().role;

if(role!=="Admin"){

    location.href="home.html";

}