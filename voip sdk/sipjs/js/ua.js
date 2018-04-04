var elements = {
    configForm: document.getElementById('config-form'),
    uaUsername: document.getElementById('ua-username'),
    uaStatus: document.getElementById('ua-status'),
    registerButton: document.getElementById('ua-register'),
    newSessionForm: document.getElementById('new-session-form'),
    inviteButton: document.getElementById('ua-invite-submit'),
    messageButton: document.getElementById('ua-message-submit'),
    uaVideo: document.getElementById('ua-video'),
    uaURI: document.getElementById('ua-uri'),
    sessionList: document.getElementById('session-list'),
    sessionTemplate: document.getElementById('session-template'),
    messageTemplate: document.getElementById('message-template')
}

var config = {
    userAgentString: 'SIP.js/0.7.8 BB',
    traceSip: true,
    register: true,
    registerExpires: 60,
    displayName: '',
    uri: '',
    authorizationUser: '',
    password: '',
    noAnswerTimeout: 45,
    wsServerMaxReconnection: 3,
    wsServerReconnectionTimeout: 5,
    iceCheckingTimeout: 2000,
    stunServers: [],
    turnServers: [],
    pushedRegister: false
}

var ua

var sessionUIs = {}

elements.configForm.addEventListener(
    'submit',
    function(e) {
        var form, i, l, name, value
        e.preventDefault()

        form = elements.configForm
        console.log(config)
        for (i = 0, l = form.length; i < l; i++) {
            name = form[i].name
            value = form[i].value
            if (name !== 'configSubmit' && value !== '') {
                config[name] = value
            }
            if (name == 'trunUrls' && value !== '') {
                config['turnServers'].urls = value
            }
            if (name == 'trunUserName' && value !== '') {
                config['turnServers'].username = value
            }
            if (name == 'trunPassWord' && value !== '') {
                config['turnServers'].password = value
            }
        }

        elements.uaStatus.innerHTML = 'Connecting...'

        console.log(config)
        ua = new SIP.UA(config)

        ua.on('connected', function() {
            elements.uaStatus.innerHTML = 'Connected (Unregistered)'
        })

        ua.on('registered', function() {
            elements.registerButton.innerHTML = 'Unregister'
            elements.uaStatus.innerHTML = 'Connected (Registered)'
        })

        ua.on('unregistered', function() {
            elements.registerButton.innerHTML = 'Register'
            elements.uaStatus.innerHTML = 'Connected (Unregistered)'
        })

        ua.on('invite', function(session) {
            createNewSessionUI(session.remoteIdentity.uri, session)
        })

        ua.on('message', function(message) {
            if (!sessionUIs[message.remoteIdentity.uri]) {
                createNewSessionUI(message.remoteIdentity.uri, null, message)
            }
        })

        document.body.className = 'started'
    },
    false
)

elements.registerButton.addEventListener(
    'click',
    function() {
        if (!ua) return

        if (ua.isRegistered()) {
            ua.unregister()
        } else {
            ua.register()
        }

        console.log(ua.isRegistered())
    },
    false
)

function inviteSubmit(e) {
    e.preventDefault()
    e.stopPropagation()

    // Parse config options
    var video = elements.uaVideo.checked
    var uri = elements.uaURI.value

    elements.uaURI.value = ''

    if (!uri) return

    // Send invite
    var session = ua.invite(uri, {
        media: {
            constraints: {
                audio: true,
                video: video
            }
        }
    })

    // Create new Session and append it to list
    var ui = createNewSessionUI(uri, session)
}

elements.inviteButton.addEventListener('click', inviteSubmit, false)

function createNewSessionUI(uri, session, message) {
    var tpl = elements.sessionTemplate
    var node = tpl.cloneNode(true)
    var sessionUI = {}
    var messageNode

    uri = session
        ? session.remoteIdentity.uri
        : SIP.Utils.normalizeTarget(uri, ua.configuration.hostport_params)
    var displayName =
        (session && session.remoteIdentity.displayName) || uri.user

    if (!uri) {
        return
    }

    // Save a bunch of data on the sessionUI for later access
    sessionUI.session = session
    sessionUI.node = node
    sessionUI.displayName = node.querySelector('.display-name')
    sessionUI.uri = node.querySelector('.uri')
    sessionUI.green = node.querySelector('.green')
    sessionUI.red = node.querySelector('.red')
    sessionUI.dtmf = node.querySelector('.dtmf')
    sessionUI.dtmfInput = node.querySelector('.dtmf input[type="text"]')
    sessionUI.video = node.querySelector('video')
    sessionUI.messages = node.querySelector('.messages')
    sessionUI.messageForm = node.querySelector('.message-form')
    sessionUI.messageInput = node.querySelector(
        '.message-form input[type="text"]'
    )
    sessionUI.mute = node.querySelector('.mute')
    sessionUI.unmute = node.querySelector('.unmute')
    sessionUI.renderHint = {
        remote: sessionUI.video
    }

    sessionUIs[uri] = sessionUI

    // Update template
    node.classList.remove('template')
    sessionUI.displayName.textContent = displayName || uri.user
    sessionUI.uri.textContent = '<' + uri + '>'

    // DOM event listeners
    sessionUI.green.addEventListener(
        'click',
        function() {
            var video = elements.uaVideo.checked
            var options = {
                media: {
                    constraints: {
                        audio: true,
                        video: video
                    }
                }
            }

            var session = sessionUI.session
            if (!session) {
                debugger
                /* TODO - Invite new session */
                /* Don't forget to enable buttons */
                session = sessionUI.session = ua.invite(uri, options)
                setUpListeners(session)
            } else if (session.accept && !session.startTime) {
                debugger
                // Incoming, not connected
                session.accept(options)
            }
        },
        false
    )

    sessionUI.red.addEventListener(
        'click',
        function() {
            var session = sessionUI.session
            if (!session) {
                return
            } else if (session.startTime) {
                // Connected
                session.bye()
            } else if (session.reject) {
                // Incoming
                session.reject()
            } else if (session.cancel) {
                // Outbound
                session.cancel()
            }
        },
        false
    )

    sessionUI.dtmf.addEventListener('submit', function(e) {
        e.preventDefault()

        var value = sessionUI.dtmfInput.value
        if (value === '' || !session) return

        sessionUI.dtmfInput.value = ''

        if (
            [
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '*',
                '#'
            ].indexOf(value) > -1
        ) {
            var options = { duration: 101 }
            session.dtmf(value, options)
        }
    })

    sessionUI.mute.addEventListener(
        'click',
        function() {
            for (var name in sessionUIs) {
                console.log(name + ': ' + sessionUIs[name])
            }
            var session = sessionUI.session
            if (!session) {
                return
            } else {
                session.mute()
            }
        },
        false
    )

    sessionUI.unmute.addEventListener(
        'click',
        function() {
            var session = sessionUI.session
            if (!session) {
                return
            } else {
                session.unmute()
            }
        },
        false
    )

    // Initial DOM state
    if (session && !session.accept) {
        sessionUI.green.disabled = true
        sessionUI.green.innerHTML = '...'
        sessionUI.red.innerHTML = 'Cancel'
    } else if (!session) {
        sessionUI.red.disabled = true
        sessionUI.green.innerHTML = 'Invite'
        sessionUI.red.innerHTML = '...'
    } else {
        sessionUI.green.innerHTML = 'Accept'
        sessionUI.red.innerHTML = 'Reject'
    }
    sessionUI.dtmfInput.disabled = true

    // SIP.js event listeners
    function setUpListeners(session) {
        sessionUI.red.disabled = false

        if (session.accept) {
            sessionUI.green.disabled = false
            sessionUI.green.innerHTML = 'Accept'
            sessionUI.red.innerHTML = 'Reject'
        } else {
            sessionUI.green.innerHMTL = '...'
            sessionUI.red.innerHTML = 'Cancel'
        }

        session.on('accepted', function() {
            sessionUI.green.disabled = true
            sessionUI.green.innerHTML = '...'
            sessionUI.red.innerHTML = 'Bye'
            sessionUI.dtmfInput.disabled = false
            sessionUI.video.className = 'on'

            session.mediaHandler.render(sessionUI.renderHint)
        })

        session.mediaHandler.on('addStream', function() {
            session.mediaHandler.render(sessionUI.renderHint)
        })

        session.on('bye', function() {
            sessionUI.green.disabled = false
            sessionUI.red.disabled = true
            sessionUI.dtmfInput.disable = true
            sessionUI.green.innerHTML = 'Invite'
            sessionUI.red.innerHTML = '...'
            sessionUI.video.className = ''
            delete sessionUI.session
            sessionUI.node.parentNode.removeChild(sessionUI.node)
        })

        session.on('failed', function() {
            sessionUI.green.disabled = false
            sessionUI.red.disabled = true
            sessionUI.dtmfInput.disable = true
            sessionUI.green.innerHTML = 'Invite'
            sessionUI.red.innerHTML = '...'
            sessionUI.video.className = ''
            delete sessionUI.session
        })

        session.on('refer', function handleRefer(request) {
            var target = request.parseHeader('refer-to').uri
            session.bye()

            createNewSessionUI(
                target,
                ua.invite(target, {
                    media: {
                        constraints: {
                            audio: true,
                            video: elements.uaVideo.checked
                        }
                    }
                })
            )
        })

        session.on('notify', function(request) {
            console.log(
                '******** notify(' + request.getHeader('Event') + ') *******'
            )
            console.log(
                '******** remote=' + session.isOnHold().remote + ' *******'
            )
            console.log(
                '******** local=' + session.isOnHold().local + ' *******'
            )
            if (
                request.getHeader('Event') == 'talk' &&
                !session.isOnHold().remote
            ) {
                var options = {
                    media: {
                        constraints: {
                            audio: true,
                            video: false
                        }
                    }
                }
                session.accept(options)
            }
            if (
                request.getHeader('Event') == 'talk' &&
                session.isOnHold().remote
            ) {
                console.log('******** session.unhold(); *******')
                session.unhold()
            }
            if (request.getHeader('Event') == 'hold') {
                console.log('******** session.hold(); *******')
                session.hold()
            }
        })

        session.on('muted', function(data) {
            console.log(data)
        })
        session.on('unmuted', function(data) {
            console.log(data)
        })
    }

    if (session) {
        setUpListeners(session)
    }

    // Add node to live session list
    elements.sessionList.appendChild(node)
}
