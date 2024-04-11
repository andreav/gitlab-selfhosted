# gitlab example

## setup

    cd gitlab
    mkdir ./gitlab-ce
    export GITLAB_HOME=$(pwd)/gitlab-ce 

    docker compose up -d

    # For connecting to gitlab
    docker compose exec gitlab bash
    
    # For connecting to runner
    docker compose exec gitlab-runner bash


## login

    docker compose exec gitlab grep 'Password:' /etc/gitlab/initial_root_password

Visit: URL: http://your-server-ip:8080

    user: root
    pwd: result of previous grep (es: boCoQgIkmw4k4YA47pjtU2tCpp068qWEf4WnKjZJLhw=)


# Creating a project

From UI create a group: testgroup and a project: testproject

Push testproject folder contained in this repo to just created testproject

## External_url:

In order for the runner to clone the repositories during pipeline execution from the right url, you should adjust the external URL. 

CHage gitlab config:

    docker compose exec gitlab bash
    vi /etc/gitlab/gitlab.rb
    external_url = "http://gitlab"

Then reconfigure gitlab (always from inside the container):

    gitlab-ctl reconfigure
    gitlab-ctl restart

In order for the runner to see the external_url, it must be on the docker network.   
Configuring the runner for being on the docker network:

* When creating the runner adding this command line option:

        --docker-network-mode gitlab-network

* Directly editing config file `/etc/gitlab-runner/config.toml`:

        [[runners]]
        ...
        [runners.docker]
            ...
            network_mode = "gitlab-network"

Note: `gitlab-network` is the network name from docker-compose.yml

# Creating a runner

From UI: Settings -> CICD -> Runners

You get a command but above all a token. Connect to gitlab-runner:

    docker compose exec gitlab-runner bash

Execute the command:  

Nota I put shell as executor executor

    gitlab-runner register -n \
    --url "http://gitlab/" \
    --registration-token <TOKEN_OBTAINED_FROM_UI> \
    --executor docker \
    --description "docker-runner" \
    --docker-image "docker:24.0.5" \
    --docker-privileged \
    --docker-volumes "/certs/client" \
    --docker-network-mode gitlab-network

You should see the new runner under: `Settings -> CICD -> Runners`

If you inspect `/etc/gitlab-runner/config.toml` from inside the runner, you get:

    [[runners]]
    name = "docker-runner"
    url = "http://gitlab/"
    id = 4
    token = "glrt-az3XPDz4yFnuxsx_dMJi"
    token_obtained_at = 2024-04-10T14:43:30Z
    token_expires_at = 0001-01-01T00:00:00Z
    executor = "docker"
    [runners.cache]
        MaxUploadedArchiveSize = 0
    [runners.docker]
        tls_verify = false
        image = "docker:24.0.5"
        privileged = true
        disable_entrypoint_overwrite = false
        oom_kill_disable = false
        disable_cache = false
        volumes = ["/certs/client", "/cache"]
        shm_size = 0
        network_mtu = 0
        network_mode = "gitlab-network"

