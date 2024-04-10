# gitlb example

## setup

    mkdir ./gitlab-ce

    docker compose up -d

    # per connettersi alla macchina
    docker exec -it gitlab /bin/bash
    .. edit ..
    docker restart gitlab


## login

    docker compose exec gitlab grep 'Password:' /etc/gitlab/initial_root_password

Visit: URL: http://your-server-ip:8080

    user: root
    pwd: quella presa prima (es: boCoQgIkmw4k4YA47pjtU2tCpp068qWEf4WnKjZJLhw=)


# Crea un gruppo ed un repo

Da UI crea un gruppo etstgroup ed un progetto testproject

Pusha un repo, ad es uno come quello nella cartella testproject

# Crea un runner

Da UI: Settings -> CICD -> Runners

Ti da un comando, lo esegui nel conatiner gitlab-runner:

    docker compose exec gitlab-runner bash

Poi, il token te lo stampa la UI  

Nota che ho messo shell come tipo di executor

    ae57b9b87df4:/# gitlab-runner register --url http://gitlab  --token <TOKEN_QUI>
    Runtime platform                arch=amd64 os=linux pid=46 revision=81ab07f6 version=16.10.0
    Running in system-mode.                            
                                                    
    Enter the GitLab instance URL (for example, https://gitlab.com/):
    [http://gitlab]: 
    Verifying runner... is valid                        runner=cze_n9kPu
    Enter a name for the runner. This is stored only in the local config.toml file:
    [ae57b9b87df4]: un-runner
    Enter an executor: instance, ssh, parallels, docker+machine, docker-autoscaler, docker-windows, kubernetes, custom, shell, virtualbox, docker:
    shell 
    Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!

    Configuration (with the authentication token) was saved in "/etc/gitlab-runner/config.toml" 

Se tutto va bene, ti compare un runner nella lista sotto Settings -> CICD -> Runners

E la prima pipeline dopo la push dovrebbe girare, e nel container del runner vedi anche un clone sotto la home: /home/gitlab-runner/builds/cze_n9kPu/0/testgroup/testproject/

Crea anche un altro runner, sempre linux, ma con un executor docker.  
Questo serve per eseguire i docker-in-docker (si può fare anche con lo shell, ma visto che sto lanciando l runner in un docker non so..)

    gitlab-runner register -n \
    --url "http://gitlab/" \
    --registration-token <TOKEN_FORNITO_DA_UI> \
    --executor docker \
    --description "docker-runner" \
    --docker-image "docker:24.0.5" \
    --docker-privileged \
    --docker-volumes "/certs/client"

Questo scrive nel toml una sezione tipo questa:

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


## Se il runner cerca di clonare URL esoterici:

Cambia nella config di gitlab il suo url esterno:

    docker compose exec gitlab bash
    vi /etc/gitlab/gitlab.rb
    external_url = "http://gitlab"

Poi

    gitlab-ctl reconfigure
    gitlab-ctl restart

Cosi il runner lo cerca a gitlab ed essendo nella rete docker, lo trova

Ma per trovarlo, il runner deve stare sulla stessa rete degli altri, quindi nella sua config glielo dici:

O lo fai quando crei il runner:

    --docker-network-mode gitlab-network

O lo fai dal toml:

    [[runners]]
    ...
    [runners.docker]
        ...
        network_mode = "gitlab-network"

Nota, la rete è quella del docker-compose.yml