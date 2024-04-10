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
    pwd: quella presa prima


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

