const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, connectFirestoreEmulator, setDoc, Timestamp } = require('firebase/firestore');
const releases = require('./seed.json');

const firebaseApp = initializeApp({
	apiKey: 'AIzaSyD05qufwWwM__1JDgwEjqK3lH2OzojDY9g',
	authDomain: 'frameworkawareness-poc.firebaseapp.com',
	projectId: 'frameworkawareness-poc',
	storageBucket: 'frameworkawareness-poc.appspot.com',
	messagingSenderId: '2336730892',
	appId: '1:2336730892:web:8f0f54ba4294049eb3a329'
});
const db = getFirestore(firebaseApp);
connectFirestoreEmulator(db, 'localhost', 8080);

let major = 0;
let minor = 0;
let patch = 0;

for (let release of releases) {
  const releasesRef = collection(db, 'releases')
  const releaseDoc = doc(releasesRef, release.name);
  const featuresRef = collection(releaseDoc, 'features');
  
  patch = patch > 24 ? 0 : patch + 1;
  minor = patch > 24 ? minor + 1 : minor + 1;
  minor = minor > 22 ? 0 : minor + 1;
  major = minor > 22 ? 0 : major + 1;

  let summary = release.features[0].feature;
  const summaryLength = summary.length;
  if(summaryLength > 200) {
    summary = summary.substring(0, 200) + '...';
  }

  setDoc(releaseDoc, {
    author: { 
      uid: 'ip0bBYSQfVoBfEBj1fqXCmzP1uSa',
      displayName: 'David East',
      photoURL: 'https://pbs.twimg.com/profile_images/1429504343875670016/zjwrjcGY_400x400.jpg'
    },
    body: release.features[0].feature,
    timestamp: Timestamp.fromDate(new Date(release.date)),
    title: release.name,
    version: `${major}.${minor}.${patch}`,
    summary,
  })

  for(let feature of release.features) {
    addDoc(featuresRef, feature);
  }
}
