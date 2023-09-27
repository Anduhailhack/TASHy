#!/bin/bash

while true 
do
	cd ./sacbot/TASHy/
	ngrok_old=$(grep "BASE_WEB_APP" ./.env)

	pkill ngrok 
	if [ $? -eq 0 ]
	then
		echo "ngrok killed"
	fi

	killall -9 node
        if [ $? -eq 0 ]
        then
                echo "node killed"
        fi

	ngrok http 5000 &
	sleep 4

	function get_ngrok_forwarding_address() {
	    local ngrok_api_url="http://localhost:4040/api/tunnels"
	    local forwarding_address

	    # Make API request to ngrok API and extract the forwarding address
	    forwarding_address=$(curl -s "$ngrok_api_url" | jq -r '.tunnels[0].public_url')

	    echo "$forwarding_address"
	}

	echo " "
	ngrok_new=$(get_ngrok_forwarding_address)

	escaped_ngrokadd=$(printf '%s\n' "$ngrok_old" | sed -e 's/[\/&]/\\&/g')
	escaped_replace=$(printf '%s\n' "BASE_WEB_APP=\"$ngrok_new\"" | sed -e 's/[\/&]/\\&/g')
	echo $escaped_replace

	if [[ -n $ngrok_new ]]; then
	    sed -i "s/$escaped_ngrokadd/$escaped_replace/g" ./.env
	    npm start &
	else
	    exit 1
	fi

	cd ../WhiteLister
	npm start &

	cd
	sleep 21600
done
