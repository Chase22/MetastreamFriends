const enterIcon = '<?xml version="1.0" encoding="UTF-8"?><svg class="metastream_friends_popup_enter_icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 92 92" xml:space="preserve"><path id="XMLID_1532_" d="M89 13v66c0 2.2-1.8 4-4 4H32.9c-2.2 0-3.9-1.8-3.9-4V60.7c0-2.2 1.8-4 4-4s4 1.8 4 4V75h44V17H37v14.3c0 2.2-1.8 4-4 4s-4-1.8-4-4V13c0-2.2 1.7-4 3.9-4H85c2.2 0 4 1.8 4 4zM46.5 58.9c-1.6 1.6-1.5 4.1 0 5.7.8.8 1.8 1.2 2.8 1.2 1 0 2.1-.4 2.8-1.2l15.7-15.8c1.5-1.6 1.5-4.1 0-5.6l-15.6-16c-1.6-1.6-4.1-1.6-5.7 0-1.6 1.6-1.6 4.1 0 5.7l8.9 9L7 42c-2.2 0-4 1.8-4 4s1.8 4 4 4l48.4-.1-8.9 9z"/><metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:dc="http://purl.org/dc/elements/1.1/"><rdf:Description about="https://iconscout.com/legal#licenses" dc:title="enter" dc:description="enter" dc:publisher="Iconscout" dc:date="2017-09-24" dc:format="image/svg+xml" dc:language="en"><dc:creator><rdf:Bag><rdf:li>Amit Jakhu</rdf:li></rdf:Bag></dc:creator></rdf:Description></rdf:RDF></metadata></svg>'
const deleteIcon = '<?xml version="1.0" encoding="UTF-8"?><svg class="metastream_friends_popup_delete_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M12 2h8v2h-8zM6 5v5h1v20h18V10h1V5H6zm17 23H9V12h14v16z"/><path d="M11 14h1v12h-1zm3 0h1v12h-1zm3 0h1v12h-1zm3 0h1v12h-1z"/><metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:dc="http://purl.org/dc/elements/1.1/"><rdf:Description about="https://iconscout.com/legal#licenses" dc:title="trash" dc:description="trash" dc:publisher="Iconscout" dc:date="2017-09-15" dc:format="image/svg+xml" dc:language="en"><dc:creator><rdf:Bag><rdf:li>IBM-Design</rdf:li></rdf:Bag></dc:creator></rdf:Description></rdf:RDF></metadata></svg>'

const popup = document.getElementById('popup');
const listWrapper = document.createElement("div");

const getLastSegment = (url) => url.substr(url.lastIndexOf('/') + 1);

const randomId = () => '_' + Math.random().toString(36).substr(2, 9);

const getFromStorage = () => browser.storage.local.get("friends").then(storage => storage.friends || []);

function addToStorage(storageId, id, name) {
    return getFromStorage().then(friends => {
        setStorage(friends.concat([{storageid: storageId, name: name, id: id}]))
    })
}

function setStorage(friends) {
    return browser.storage.local.set({
        friends: friends
    })
}

function deleteFromStorage(storageId) {
    return getFromStorage().then(friends => {
        setStorage(friends.filter(friend => friend.storageId !== storageId))
    })
}

function form(id) {
    const wrapper = document.createElement("div")
    wrapper.className = "metastream_friends_popup_add_wrapper"

    const textField = document.createElement("input")
    textField.setAttribute("type", "text")
    textField.className = "metastream_friends_popup_add_field"
    wrapper.appendChild(textField)

    const button = document.createElement("button")
    button.className = "metastream_friends_popup_add_button"
    button.innerText = "Add new"
    button.onclick = () => {
        const storageId = randomId()
        addToStorage(storageId, id, textField.value)
            .then(generateList)
    }
    wrapper.appendChild(button)

    return wrapper
}

function listEntry(storageId, id, name) {
    console.log("entry")
    const wrapper = document.createElement("div")
    wrapper.className = "metastream_friends_popup_wrapper"
    wrapper.id = storageId

    const nameElement = document.createElement('div')
    nameElement.className = "metastream_friends_popup_name"
    nameElement.innerHTML = name
    wrapper.appendChild(nameElement)


    const buttonWrapper = document.createElement("div")

    const deleteButton = document.createElement('button')
    deleteButton.className = "metastream_friends_popup_delete_button"
    deleteButton.innerHTML = deleteIcon
    deleteButton.onclick = () => {
        return deleteFromStorage(storageId).then(() => wrapper.remove()).then(generateList);
    }
    buttonWrapper.appendChild(deleteButton)

    const enterButton = document.createElement('button')
    enterButton.className = "metastream_friends_popup_enter_button"
    enterButton.innerHTML = enterIcon
    enterButton.onclick = () => browser.tabs.create({url: `https://app.getmetastream.com/join/${id}`})
    buttonWrapper.appendChild(enterButton)

    wrapper.append(buttonWrapper)

    listWrapper.appendChild(wrapper)
}

function generateList() {
    while(listWrapper.firstChild) {
        listWrapper.firstChild.remove()
    }
    getFromStorage().then(friends => {
        console.log(friends)
        if (friends.length > 0) {
            friends.forEach(
                friend => listEntry(friend.storageId, friend.id, friend.name)
            )
        } else {
            const text = document.createElement("div")
            text.innerText = "No saved sessions found"
            listWrapper.appendChild(text)
        }
    })
}

browser.tabs.query({active:true, url:"*://app.getmetastream.com/join/*"}).then(tabs => {
    if (tabs && tabs.length > 0) {
        const formElem = form(getLastSegment(tabs[0].url))
        popup.appendChild(formElem);
    }
})

popup.appendChild(listWrapper)
generateList();

